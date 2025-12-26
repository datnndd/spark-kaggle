"""Prediction routes."""
import io
import csv
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd

from app.models import (
    PredictionInput, 
    PredictionResult, 
    BatchPredictionResult,
    RiskLevel
)
from app.spark_service import spark_service
from app.config import RISK_THRESHOLDS

router = APIRouter(prefix="/predict", tags=["predictions"])


def get_risk_level(risk: float) -> RiskLevel:
    """Determine risk level based on thresholds."""
    if risk < RISK_THRESHOLDS["low"]:
        return RiskLevel.LOW
    elif risk < RISK_THRESHOLDS["medium"]:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.HIGH


def create_prediction_result(risk: float, input_data: dict = None) -> PredictionResult:
    """Create a PredictionResult from risk value."""
    return PredictionResult(
        accident_risk=round(risk, 4),
        risk_level=get_risk_level(risk),
        risk_percentage=round(risk * 100, 2),
        input_data=input_data
    )


@router.post("", response_model=PredictionResult)
async def predict_single(input_data: PredictionInput):
    """
    Predict accident risk for a single road segment.
    
    Returns the predicted accident risk (0-1), risk level, and percentage.
    """
    try:
        # Convert Pydantic model to dict with enum values as strings
        data = {
            "road_type": input_data.road_type.value,
            "num_lanes": input_data.num_lanes,
            "curvature": input_data.curvature,
            "speed_limit": input_data.speed_limit,
            "lighting": input_data.lighting.value,
            "weather": input_data.weather.value,
            "road_signs_present": input_data.road_signs_present,
            "public_road": input_data.public_road,
            "time_of_day": input_data.time_of_day.value,
            "holiday": input_data.holiday,
            "school_season": input_data.school_season,
            "num_reported_accidents": input_data.num_reported_accidents,
        }
        
        risk = spark_service.predict_single(data)
        return create_prediction_result(risk, data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/batch", response_model=BatchPredictionResult)
async def predict_batch(file: UploadFile = File(...)):
    """
    Predict accident risk for multiple road segments from a CSV file.
    
    The CSV file should contain columns matching the input features.
    Returns predictions for each row along with summary statistics.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    
    try:
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Required columns
        required_columns = [
            "road_type", "num_lanes", "curvature", "speed_limit",
            "lighting", "weather", "road_signs_present", "public_road",
            "time_of_day", "holiday", "school_season", "num_reported_accidents"
        ]
        
        # Validate columns
        missing_cols = set(required_columns) - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_cols)}"
            )
        
        # Convert DataFrame to list of dicts
        data_list = df[required_columns].to_dict('records')
        
        # Make batch predictions
        risks = spark_service.predict_batch(data_list)
        
        # Create prediction results
        predictions = [
            create_prediction_result(risk, data)
            for risk, data in zip(risks, data_list)
        ]
        
        # Calculate summary
        avg_risk = sum(risks) / len(risks) if risks else 0
        risk_counts = {
            "low": sum(1 for r in risks if r < RISK_THRESHOLDS["low"]),
            "medium": sum(1 for r in risks if RISK_THRESHOLDS["low"] <= r < RISK_THRESHOLDS["medium"]),
            "high": sum(1 for r in risks if r >= RISK_THRESHOLDS["medium"]),
        }
        
        return BatchPredictionResult(
            predictions=predictions,
            total_count=len(predictions),
            summary={
                "average_risk": round(avg_risk, 4),
                "average_percentage": round(avg_risk * 100, 2),
                "risk_distribution": risk_counts,
                "min_risk": round(min(risks), 4) if risks else 0,
                "max_risk": round(max(risks), 4) if risks else 0,
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")
