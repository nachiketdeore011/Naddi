"""
Test configuration for backend integration tests.
Uses SQLite in-memory database for testing.
"""

import os
import pytest

os.environ["DATABASE_URL"] = "sqlite:///test_nadi.db"
os.environ["ML_SERVICE_URL"] = "http://localhost:8001"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.connection import Base, get_db
from app.main import app
from app.services.batch_writer import batch_writer
from app.routes.websocket import manager

TEST_ENGINE = create_engine(
    "sqlite:///test_nadi.db",
    connect_args={"check_same_thread": False},
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture(autouse=True)
def reset_manager():
    manager.frontend_connections.clear()
    manager.device_connections.clear()
    manager.sample_buffers.clear()
    manager.device_patient_map.clear()
    manager.device_sessions.clear()
    yield
    manager.frontend_connections.clear()
    manager.device_connections.clear()
    manager.sample_buffers.clear()
    manager.device_patient_map.clear()
    manager.device_sessions.clear()


@pytest.fixture
def db_engine():
    """Provide the test SQLite engine."""
    return TEST_ENGINE


@pytest.fixture
def app_with_db(db_engine):
    """Create a test patient and pulse session in the DB."""
    from app.models.patient import Patient
    from app.models.pulse import PulseSession
    import uuid

    patient_id = uuid.uuid4()
    session_id = uuid.uuid4()

    with TestSession() as db:
        patient = Patient(id=patient_id, name="Test Patient", age=30, gender="M")
        db.add(patient)
        db.commit()

        pulse_session = PulseSession(
            id=session_id,
            patient_id=patient_id,
            device_id="test-device",
            sample_rate=100,
            status="in_progress",
        )
        db.add(pulse_session)
        db.commit()

    return {"patient_id": patient_id, "session_id": session_id}


@pytest.fixture
def client():
    """Provide a TestClient for the app."""
    from starlette.testclient import TestClient
    return TestClient(app)