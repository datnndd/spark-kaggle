"""Spark service for model loading and predictions."""
import os
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, FloatType, BooleanType
from pyspark.sql import functions as F
from typing import List, Dict, Any, Optional
from app.config import SPARK_APP_NAME, MODEL_PATH


class SparkService:
    """Service class for Spark operations."""
    
    _instance: Optional['SparkService'] = None
    _spark: Optional[SparkSession] = None
    _model: Optional[PipelineModel] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @property
    def spark(self) -> SparkSession:
        """Get or create Spark session."""
        if self._spark is None:
            # Ensure spark-events directory exists
            spark_events_dir = "/tmp/spark-events"
            os.makedirs(spark_events_dir, exist_ok=True)
            
            self._spark = (SparkSession.builder
                .appName(SPARK_APP_NAME)
                .master("local[*]")
                .config("spark.driver.memory", "2g")
                .config("spark.sql.shuffle.partitions", "2")
                .config("spark.ui.enabled", "false")
                .getOrCreate())
            self._spark.sparkContext.setLogLevel("WARN")
        return self._spark
    
    @property
    def model(self) -> PipelineModel:
        """Get or load the ML pipeline model."""
        if self._model is None:
            self._model = PipelineModel.load(MODEL_PATH)
        return self._model
    
    def get_input_schema(self) -> StructType:
        """Define the schema for input data."""
        return StructType([
            StructField("road_type", StringType(), True),
            StructField("num_lanes", IntegerType(), True),
            StructField("curvature", FloatType(), True),
            StructField("speed_limit", IntegerType(), True),
            StructField("lighting", StringType(), True),
            StructField("weather", StringType(), True),
            StructField("road_signs_present", BooleanType(), True),
            StructField("public_road", BooleanType(), True),
            StructField("time_of_day", StringType(), True),
            StructField("holiday", BooleanType(), True),
            StructField("school_season", BooleanType(), True),
            StructField("num_reported_accidents", IntegerType(), True),
        ])
    
    def add_engineered_features(self, df):
        """Add feature engineering columns required by the pipeline.
        
        The trained pipeline expects these derived features:
        - lighting_bin: Binned version of lighting (e.g., 'day' vs 'night')
        - is_night: Boolean flag for night conditions
        - bad_visibility: Boolean flag for poor visibility (night + bad weather)
        - curvature_x_weather: Interaction feature between curvature and weather
        """
        # Create lighting_bin (simplify lighting to day/night categories)
        df = df.withColumn(
            "lighting_bin",
            F.when(F.col("lighting") == "night", "night")
             .when(F.col("lighting") == "dim", "dim")
             .otherwise("day")
        )
        
        # is_night: 1 if lighting is "night", else 0
        df = df.withColumn(
            "is_night",
            F.when(F.col("lighting") == "night", 1).otherwise(0)
        )
        
        # bad_visibility: 1 if (night or dim) AND (rainy or foggy)
        df = df.withColumn(
            "bad_visibility",
            F.when(
                (F.col("lighting").isin(["night", "dim"])) & 
                (F.col("weather").isin(["rainy", "foggy"])),
                1
            ).otherwise(0)
        )
        
        # curvature_x_weather: curvature multiplied by weather risk factor
        # Weather risk: clear=0, rainy=1, foggy=2
        df = df.withColumn(
            "weather_risk",
            F.when(F.col("weather") == "foggy", 2.0)
             .when(F.col("weather") == "rainy", 1.0)
             .otherwise(0.0)
        )
        df = df.withColumn(
            "curvature_x_weather",
            F.col("curvature") * (1 + F.col("weather_risk"))
        )
        
        # Convert boolean columns to integers (required by VectorAssembler)
        df = df.withColumn("road_signs_present", F.col("road_signs_present").cast("int"))
        df = df.withColumn("public_road", F.col("public_road").cast("int"))
        df = df.withColumn("holiday", F.col("holiday").cast("int"))
        df = df.withColumn("school_season", F.col("school_season").cast("int"))
        
        return df
    
    def predict_single(self, data: Dict[str, Any]) -> float:
        """Make prediction for a single input."""
        # Convert data to row format
        row_data = [(
            data["road_type"],
            int(data["num_lanes"]),
            float(data["curvature"]),
            int(data["speed_limit"]),
            data["lighting"],
            data["weather"],
            bool(data["road_signs_present"]),
            bool(data["public_road"]),
            data["time_of_day"],
            bool(data["holiday"]),
            bool(data["school_season"]),
            int(data["num_reported_accidents"]),
        )]
        
        # Create DataFrame with schema
        df = self.spark.createDataFrame(row_data, self.get_input_schema())
        
        # Add engineered features
        df = self.add_engineered_features(df)
        
        # Make prediction
        predictions = self.model.transform(df)
        result = predictions.select("prediction").collect()[0]["prediction"]
        
        # Clamp result between 0 and 1
        return max(0.0, min(1.0, float(result)))
    
    def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[float]:
        """Make predictions for multiple inputs."""
        # Convert data to rows
        rows = [
            (
                d["road_type"],
                int(d["num_lanes"]),
                float(d["curvature"]),
                int(d["speed_limit"]),
                d["lighting"],
                d["weather"],
                bool(d["road_signs_present"]),
                bool(d["public_road"]),
                d["time_of_day"],
                bool(d["holiday"]),
                bool(d["school_season"]),
                int(d["num_reported_accidents"]),
            )
            for d in data_list
        ]
        
        # Create DataFrame
        df = self.spark.createDataFrame(rows, self.get_input_schema())
        
        # Add engineered features
        df = self.add_engineered_features(df)
        
        # Make predictions
        predictions = self.model.transform(df)
        results = predictions.select("prediction").collect()
        
        return [max(0.0, min(1.0, float(r["prediction"]))) for r in results]
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._model is not None
    
    def get_spark_version(self) -> str:
        """Get Spark version."""
        return self.spark.version


# Singleton instance
spark_service = SparkService()
