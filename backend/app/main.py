"""
Nadi Diagnosis System - Backend API
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import patients, pulse, websocket, simulator, devices
from app.database.connection import engine, Base
from app.services.batch_writer import batch_writer
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start/stop the batch writer on app lifecycle."""
    batch_writer.start()
    yield
    await batch_writer.stop()


# Create tables if they don't exist (works for SQLite dev).
# In production with PostgreSQL, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nadi Diagnosis API",
    description="API for Nadi Pariksha pulse diagnosis system",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for frontend - reads from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(pulse.router, prefix="/api/pulse", tags=["Pulse"])
app.include_router(websocket.router, prefix="/api/pulse", tags=["WebSocket"])
app.include_router(simulator.router, prefix="/api/pulse", tags=["Simulator"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])


@app.get("/")
def root():
    return {"message": "Nadi Diagnosis System API", "version": "0.1.0"}


@app.get("/api/health")
def health_check():
    from app.services.batch_writer import batch_writer
    return {
        "status": "healthy",
        "batch_writer": batch_writer.get_stats(),
    }
