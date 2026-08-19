"""Patient database model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, Uuid

from app.database.connection import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Uuid(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
