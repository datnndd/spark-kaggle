"""Configuration settings for the backend."""
import os

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Spark configuration
SPARK_APP_NAME = "TrafficAccidentPredictor"
MODEL_PATH = os.path.join(BASE_DIR, "accident_risk_pipeline_v1")

# API configuration
API_PREFIX = "/api"
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Feature definitions
ROAD_TYPES = ["urban", "rural", "highway"]
LIGHTING_OPTIONS = ["daylight", "dim", "night"]
WEATHER_OPTIONS = ["clear", "rainy", "foggy"]
TIME_OF_DAY_OPTIONS = ["morning", "afternoon", "evening", "night"]

# Risk level thresholds
RISK_THRESHOLDS = {
    "low": 0.3,
    "medium": 0.6,
    "high": 1.0
}
