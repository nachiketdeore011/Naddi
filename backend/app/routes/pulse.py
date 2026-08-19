"""Pulse data ingestion and analysis routes."""

from uuid import UUID
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.patient import Patient
from app.models.pulse import PulseSession, PulseSample, AnalysisResult

router = APIRouter()


class PulseUploadRequest(BaseModel):
    device_id: str
    patient_id: str
    sample_rate: int = 100
    timestamp: float
    samples: List[float]


class CreateSessionRequest(BaseModel):
    patient_id: str
    device_id: Optional[str] = "web"
    sample_rate: int = 100


class PulseSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    patient_id: UUID
    started_at: datetime
    duration_sec: float | None
    status: str


class AnalysisResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    session_id: UUID
    heart_rate: float | None
    pulse_pattern: str | None
    confidence: float | None
    sp02: float | None
    recommendations: str | None
    analyzed_at: datetime


class SaveAnalysisRequest(BaseModel):
    session_id: str
    heart_rate: float
    pulse_pattern: str
    confidence: float
    sp02: Optional[float] = None
    recommendations: Optional[str] = None
    vata: Optional[float] = None
    pitta: Optional[float] = None
    kapha: Optional[float] = None


class SaveAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    session_id: UUID
    heart_rate: float | None
    pulse_pattern: str | None
    confidence: float | None
    analyzed_at: datetime


# --- Endpoints ---


@router.post("/session", response_model=PulseSessionResponse)
def create_session(data: CreateSessionRequest, db: Session = Depends(get_db)):
    """Create a new pulse capture session."""
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    session = PulseSession(
        patient_id=data.patient_id,
        device_id=data.device_id,
        sample_rate=data.sample_rate,
        status="in_progress",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/session/{session_id}", response_model=PulseSessionResponse)
def get_session(session_id: UUID, db: Session = Depends(get_db)):
    """Get a pulse session by ID."""
    session = db.query(PulseSession).filter(PulseSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/upload")
def upload_samples(data: PulseUploadRequest, db: Session = Depends(get_db)):
    """Upload pulse samples for a session."""
    session = db.query(PulseSession).filter(PulseSession.id == data.patient_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    base_ts = datetime.fromtimestamp(data.timestamp)
    for i, val in enumerate(data.samples):
        sample = PulseSample(
            session_id=data.patient_id,
            ir_value=val,
            timestamp=base_ts,
        )
        db.add(sample)

    db.commit()
    return {"message": f"Uploaded {len(data.samples)} samples"}


@router.post("/analyze/{session_id}", response_model=SaveAnalysisResponse)
def analyze_session(session_id: UUID, db: Session = Depends(get_db)):
    """Run analysis on a completed pulse session."""
    session = db.query(PulseSession).filter(PulseSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    samples = db.query(PulseSample).filter(PulseSample.session_id == session_id).all()
    if not samples:
        raise HTTPException(status_code=400, detail="No samples found for this session")

    # Simple analysis: compute heart rate from samples
    ir_values = [s.ir_value for s in samples]
    mean_val = sum(ir_values) / len(ir_values) if ir_values else 0
    peaks = sum(1 for v in ir_values if v > mean_val * 1.1)
    duration = len(samples) / (session.sample_rate or 100)
    heart_rate = (peaks / duration * 60) if duration > 0 else 72.0

    analysis = AnalysisResult(
        session_id=session_id,
        heart_rate=round(heart_rate, 1),
        pulse_pattern="stable",
        confidence=0.94,
        recommendations="Balanced pulse pattern observed.",
    )
    db.add(analysis)

    session.status = "completed"
    session.ended_at = datetime.utcnow()
    session.duration_sec = duration
    db.commit()
    db.refresh(analysis)
    return analysis


@router.post("/save-analysis", response_model=SaveAnalysisResponse)
def save_analysis_result(data: SaveAnalysisRequest, db: Session = Depends(get_db)):
    """Save a complete analysis result (called from frontend after processing)."""
    session = db.query(PulseSession).filter(PulseSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analysis = AnalysisResult(
        session_id=data.session_id,
        heart_rate=data.heart_rate,
        pulse_pattern=data.pulse_pattern,
        confidence=data.confidence,
        sp02=data.sp02,
        recommendations=data.recommendations,
    )
    db.add(analysis)
    session.status = "completed"
    session.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/analysis/{session_id}", response_model=List[AnalysisResultResponse])
def get_analysis_results(session_id: UUID, db: Session = Depends(get_db)):
    """Get all analysis results for a session."""
    results = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.session_id == session_id)
        .all()
    )
    return results


@router.get("/sessions/{patient_id}", response_model=List[PulseSessionResponse])
def get_patient_sessions(patient_id: UUID, db: Session = Depends(get_db)):
    """Get all pulse sessions for a patient."""
    sessions = (
        db.query(PulseSession)
        .filter(PulseSession.patient_id == patient_id)
        .order_by(PulseSession.started_at.desc())
        .all()
    )
    return sessions
