"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from enum import Enum


class RoadType(str, Enum):
    URBAN = "urban"
    RURAL = "rural"
    HIGHWAY = "highway"


class Lighting(str, Enum):
    DAYLIGHT = "daylight"
    DIM = "dim"
    NIGHT = "night"


class Weather(str, Enum):
    CLEAR = "clear"
    RAINY = "rainy"
    FOGGY = "foggy"


class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"


class PredictionInput(BaseModel):
    """Input schema for single prediction."""
    road_type: RoadType
    num_lanes: int = Field(..., ge=1, le=8, description="Number of lanes (1-8)")
    curvature: float = Field(..., ge=0.0, le=1.0, description="Road curvature (0.0-1.0)")
    speed_limit: int = Field(..., ge=15, le=120, description="Speed limit in mph")
    lighting: Lighting
    weather: Weather
    road_signs_present: bool
    public_road: bool
    time_of_day: TimeOfDay
    holiday: bool
    school_season: bool
    num_reported_accidents: int = Field(..., ge=0, description="Number of reported accidents")

    class Config:
        json_schema_extra = {
            "example": {
                "road_type": "urban",
                "num_lanes": 2,
                "curvature": 0.06,
                "speed_limit": 35,
                "lighting": "daylight",
                "weather": "rainy",
                "road_signs_present": False,
                "public_road": True,
                "time_of_day": "afternoon",
                "holiday": False,
                "school_season": True,
                "num_reported_accidents": 1
            }
        }


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PredictionResult(BaseModel):
    """Output schema for prediction result."""
    accident_risk: Optional[float] = Field(None, description="Predicted accident risk (0.0-1.0)")
    risk_level: Optional[RiskLevel] = None
    risk_percentage: Optional[float] = Field(None, description="Risk as percentage (0-100)")
    input_data: Optional[dict] = None
    error: Optional[str] = None


class BatchPredictionResult(BaseModel):
    """Output schema for batch predictions."""
    predictions: List[PredictionResult]
    total_count: int
    summary: dict


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    spark_version: Optional[str] = None
