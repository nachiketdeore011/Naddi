"""Pulse-related database models."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Uuid

from app.database.connection import Base


class PulseSession(Base):
    __tablename__ = "pulse_sessions"

    id = Column(Uuid(), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(), ForeignKey("patients.id"), nullable=False)
    device_id = Column(String(100), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_sec = Column(Float, nullable=True)
    sample_rate = Column(Integer, default=100)
    status = Column(String(20), default="in_progress")  # in_progress, completed


class PulseSample(Base):
    __tablename__ = "pulse_samples"

    id = Column(Uuid(), primary_key=True, default=uuid.uuid4)
    session_id = Column(Uuid(), ForeignKey("pulse_sessions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    red_value = Column(Float, nullable=True)
    ir_value = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=True)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Uuid(), primary_key=True, default=uuid.uuid4)
    session_id = Column(Uuid(), ForeignKey("pulse_sessions.id"), nullable=False)
    heart_rate = Column(Float, nullable=True)
    pulse_pattern = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True)
    sp02 = Column(Float, nullable=True)
    recommendations = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
