"""
SafeRoute AI — Bengaluru NightRide
FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from backend.config import settings
from backend.database import engine, Base
from backend.routers import accidents, segments, simulator, recommendations, analytics
from backend.services.risk_engine import risk_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SafeRoute AI database and ML risk engine...")
    Base.metadata.create_all(bind=engine)
    total_segments = len(risk_engine.df_segments) if risk_engine.df_segments is not None else 0
    logger.info(f"Loaded {total_segments} road segments with calibrated Safety Scores.")
    yield
    logger.info("SafeRoute AI shutdown complete.")


app = FastAPI(
    title="SafeRoute AI — Bengaluru NightRide API",
    description=(
        "AI-powered predictive road safety intelligence platform that predicts high-risk "
        "night-time road segments in Bengaluru, explains why they are risky, "
        "and recommends what authorities should fix first."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Frontend (Vite, React, Next.js)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(segments.router, prefix="/api/v1/segments", tags=["segments"])
app.include_router(simulator.router, prefix="/api/v1/simulate", tags=["simulation"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(accidents.router, prefix="/api/v1/accidents", tags=["accidents"])


@app.get("/")
async def root():
    total_segments = len(risk_engine.df_segments) if risk_engine.df_segments is not None else 0
    return {
        "platform": "SafeRoute AI — Bengaluru NightRide",
        "version": "1.0.0",
        "status": "operational",
        "total_analyzed_segments": total_segments,
        "docs_url": "/docs",
        "api_contract": "/api/v1"
    }


@app.get("/health")
async def health_check():
    total_segments = len(risk_engine.df_segments) if risk_engine.df_segments is not None else 0
    return {
        "status": "healthy",
        "version": "1.0.0",
        "dataset_loaded": total_segments > 0,
        "total_segments": total_segments
    }
