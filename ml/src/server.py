"""
ML inference server - provides REST API for pulse analysis.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from src.inference import PulseAnalyzer

app = FastAPI(title="Nadi ML Service", version="0.1.0")
analyzer = PulseAnalyzer()


class AnalyzeRequest(BaseModel):
    samples: List[float]
    sample_rate: int = 100


class AnalyzeResponse(BaseModel):
    heart_rate: float
    pulse_pattern: str
    confidence: float
    recommendations: str
    sample_count: int
    duration_sec: float


@app.get("/")
def root():
    return {"message": "Nadi ML Service", "model_loaded": analyzer.artifact is not None}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_pulse(data: AnalyzeRequest):
    if not data.samples:
        raise HTTPException(status_code=400, detail="No samples provided")
    if len(data.samples) < 100:
        raise HTTPException(status_code=400, detail="At least 100 samples required for reliable analysis")

    result = analyzer.analyze(data.samples, data.sample_rate)

    return AnalyzeResponse(
        heart_rate=result["heart_rate"],
        pulse_pattern=result["pulse_pattern"],
        confidence=result["confidence"],
        recommendations=result["recommendations"],
        sample_count=result["sample_count"],
        duration_sec=result["duration_sec"],
    )


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": analyzer.artifact is not None}
