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
    _label_map: Optional[Dict[int, str]] = None
    
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
            # Extract label mapping from StringIndexer
            self._extract_label_map()
        return self._model
    
    def _extract_label_map(self):
        """Extract label mapping from the StringIndexer stage for the target variable."""
        if self._model is None:
            return
        
        # The first stage (index 0) is the StringIndexer for accident_risk_level
        # It transforms the target column to numeric labels
        stage0 = self._model.stages[0]
        if hasattr(stage0, 'labels'):
            labels = stage0.labels
            self._label_map = {i: label for i, label in enumerate(labels)}
            return
        
        # Default mapping if not found
        self._label_map = {0: "low", 1: "high", 2: "medium"}
    
    def get_label_map(self) -> Dict[int, str]:
        """Get the label mapping for predictions."""
        if self._label_map is None:
            _ = self.model  # Force model load which extracts label map
        return self._label_map or {0: "low", 1: "high", 2: "medium"}
    
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
        
        Based on the LogisticRegression notebook, the model expects these derived features:
        - is_night: 1 if lighting == 'night'
        - bad_weather: 1 if weather in ('foggy', 'rainy')
        - high_curvature: 1 if curvature >= 0.5
        - high_speed: 1 if speed_limit >= 60
        - night_high_curvature: is_night * high_curvature
        - night_high_speed: is_night * high_speed
        - high_curvature_bad_weather: high_curvature * bad_weather
        - curvature_x_night: curvature * is_night
        - speed_x_night: speed_limit * is_night
        - road_signs_present_i, public_road_i, holiday_i, school_season_i: boolean to int
        """
        # is_night: 1 if lighting is "night", else 0
        df = df.withColumn(
            "is_night",
            (F.col("lighting") == "night").cast("int")
        )
        
        # bad_weather: 1 if weather is foggy or rainy
        df = df.withColumn(
            "bad_weather",
            F.col("weather").isin("foggy", "rainy").cast("int")
        )
        
        # high_curvature: 1 if curvature >= 0.5
        df = df.withColumn(
            "high_curvature",
            (F.col("curvature") >= 0.5).cast("int")
        )
        
        # high_speed: 1 if speed_limit >= 60
        df = df.withColumn(
            "high_speed",
            (F.col("speed_limit") >= 60).cast("int")
        )
        
        # Interaction features
        df = df.withColumn(
            "night_high_curvature",
            (F.col("is_night") * F.col("high_curvature")).cast("int")
        )
        
        df = df.withColumn(
            "night_high_speed",
            (F.col("is_night") * F.col("high_speed")).cast("int")
        )
        
        df = df.withColumn(
            "high_curvature_bad_weather",
            (F.col("high_curvature") * F.col("bad_weather")).cast("int")
        )
        
        # Continuous interaction features
        df = df.withColumn(
            "curvature_x_night",
            F.col("curvature") * F.col("is_night")
        )
        
        df = df.withColumn(
            "speed_x_night",
            F.col("speed_limit") * F.col("is_night")
        )
        
        # Convert boolean columns to integers with _i suffix
        df = df.withColumn("road_signs_present_i", F.col("road_signs_present").cast("int"))
        df = df.withColumn("public_road_i", F.col("public_road").cast("int"))
        df = df.withColumn("holiday_i", F.col("holiday").cast("int"))
        df = df.withColumn("school_season_i", F.col("school_season").cast("int"))
        
        return df
    
    def predict_single(self, data: Dict[str, Any]) -> str:
        """Make prediction for a single input.
        
        Returns the predicted risk level as a string ('low', 'medium', or 'high').
        """
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
        prediction_idx = int(predictions.select("prediction").collect()[0]["prediction"])
        
        # Map prediction to risk level
        label_map = self.get_label_map()
        return label_map.get(prediction_idx, "medium")
    
    def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[str]:
        """Make predictions for multiple inputs.
        
        Returns a list of risk levels as strings ('low', 'medium', or 'high').
        """
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
        
        label_map = self.get_label_map()
        return [label_map.get(int(r["prediction"]), "medium") for r in results]
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._model is not None
    
    def get_spark_version(self) -> str:
        """Get Spark version."""
        return self.spark.version


# Singleton instance
spark_service = SparkService()
