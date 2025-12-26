"""FastAPI main application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_PREFIX, CORS_ORIGINS
from app.models import HealthResponse
from app.spark_service import spark_service
from app.routes import predict


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown."""
    # Startup: Initialize Spark and load model
    print("🚀 Starting Traffic Accident Prediction API...")
    print(f"📊 Spark version: {spark_service.get_spark_version()}")
    
    # Pre-load the model
    _ = spark_service.model
    print("✅ ML Pipeline model loaded successfully")
    
    yield
    
    # Shutdown: Clean up Spark
    print("🛑 Shutting down...")
    if spark_service._spark:
        spark_service._spark.stop()
        print("✅ Spark session stopped")


# Create FastAPI application
app = FastAPI(
    title="Traffic Accident Risk Prediction API",
    description="""
    🚗 **TrafficSafe API** - Predict accident risk on road segments
    
    This API uses a Spark ML pipeline model trained on traffic data to predict
    the probability of accidents based on road characteristics and environmental factors.
    
    ## Features
    - **Single Prediction**: Predict risk for one road segment
    - **Batch Prediction**: Upload CSV file for multiple predictions
    
    ## Input Features
    - Road characteristics: type, lanes, curvature, speed limit, signs
    - Environmental: lighting, weather, time of day
    - Context: holiday, school season, accident history
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix=API_PREFIX)


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "TrafficSafe API",
        "version": "1.0.0",
        "description": "Traffic Accident Risk Prediction API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=spark_service.is_model_loaded(),
        spark_version=spark_service.get_spark_version(),
    )
