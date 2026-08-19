"""
Integration tests for the full WebSocket data flow.

Tests the complete pipeline using Starlette's TestClient:
  Device -> Backend WebSocket -> Broadcast -> Frontend WebSocket
  Device -> Backend -> Batch Writer -> Database

No external uvicorn server or websockets client library needed.
"""
import asyncio
import json
import pytest
from starlette.testclient import TestClient

from app.routes.websocket import manager
from app.services.batch_writer import batch_writer


# ---------------------------------------------------------------------------
# Device WebSocket tests
# ---------------------------------------------------------------------------

def test_device_connect_and_register(client, app_with_db):
    """Device connects and sends a registration message."""
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-001") as ws:
        ws.send_json({
            "type": "register",
            "device_id": "test-device-001",
            "patient_id": str(app_with_db["patient_id"]),
        })
        resp = ws.receive_json()
        assert resp["type"] in ("registered", "welcome", "ack")

        # Verify device is tracked
        assert "test-device-001" in manager.device_connections


def test_device_sends_samples(client, app_with_db):
    """Device sends samples and receives acknowledgement."""
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-002") as ws:
        # Register
        ws.send_json({
            "type": "register",
            "device_id": "test-device-002",
            "patient_id": str(app_with_db["patient_id"]),
        })
        ws.receive_json()

        # Send samples
        ws.send_json({
            "type": "samples",
            "samples": [1.2, 3.4, 5.6, 7.8, 9.0],
        })
        resp = ws.receive_json()
        assert resp["type"] == "ack"
        assert resp["samples_received"] == 5


def test_device_auto_register(client, app_with_db):
    """Device sends samples without registering -- auto-creates session."""
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-003") as ws:
        # Send samples directly (no registration)
        ws.send_json({
            "patient_id": str(app_with_db["patient_id"]),
            "samples": [1.0, 2.0, 3.0],
        })
        resp = ws.receive_json()
        assert resp["type"] == "ack"

        # Device should be auto-registered
        assert "test-device-003" in manager.device_connections


# ---------------------------------------------------------------------------
# Frontend WebSocket tests
# ---------------------------------------------------------------------------

def test_frontend_connects_and_receives_buffer(client, app_with_db):
    """Frontend connects and receives initial buffer message."""
    with client.websocket_connect(f"/api/pulse/ws/pulse/{app_with_db['patient_id']}") as ws:
        data = ws.receive_json()
        assert data["type"] == "buffer"
        assert "samples" in data


def test_frontend_ping_pong(client, app_with_db):
    """Frontend receives pong for ping."""
    with client.websocket_connect(f"/api/pulse/ws/pulse/{app_with_db['patient_id']}") as ws:
        # Receive initial buffer
        ws.receive_json()

        # Send ping
        ws.send_json({"type": "ping"})
        resp = ws.receive_json()
        assert resp["type"] == "pong"


def test_frontend_trigger_analysis(client, app_with_db):
    """Frontend can trigger analysis."""
    with client.websocket_connect(f"/api/pulse/ws/pulse/{app_with_db['patient_id']}") as ws:
        ws.receive_json()  # buffer

        ws.send_json({"type": "trigger_analysis"})
        resp = ws.receive_json()
        assert resp["type"] == "info"
        assert "Analysis triggered" in resp["message"]


# ---------------------------------------------------------------------------
# Broadcast flow tests
# ---------------------------------------------------------------------------

def test_device_broadcast_reaches_frontend(client, app_with_db):
    """Samples from device are broadcast to connected frontend."""
    patient_id = str(app_with_db["patient_id"])

    with client.websocket_connect(f"/api/pulse/ws/device/test-device-004") as device_ws, \
         client.websocket_connect(f"/api/pulse/ws/pulse/{patient_id}") as frontend_ws:

        # Frontend receives buffer first
        buffer_msg = frontend_ws.receive_json()
        assert buffer_msg["type"] == "buffer"

        # Register device
        device_ws.send_json({
            "type": "register",
            "device_id": "test-device-004",
            "patient_id": patient_id,
        })
        device_ws.receive_json()

        # Device sends samples
        test_samples = [10.5, 20.3, 30.1, 40.7, 50.2]
        device_ws.send_json({
            "type": "samples",
            "samples": test_samples,
        })
        device_ws.receive_json()  # ack

        # Frontend should receive broadcast
        data_msg = frontend_ws.receive_json()
        assert data_msg["type"] == "samples"
        assert data_msg["samples"] == test_samples


def test_frontend_receives_buffer_on_connect(client, app_with_db):
    """New frontend connection receives buffered recent samples."""
    patient_id = str(app_with_db["patient_id"])

    # First: device sends some samples
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-005") as device_ws:
        device_ws.send_json({
            "type": "register",
            "device_id": "test-device-005",
            "patient_id": patient_id,
        })
        device_ws.receive_json()

        for i in range(5):
            device_ws.send_json({
                "type": "samples",
                "samples": [float(i * 10 + j) for j in range(10)],
            })
            device_ws.receive_json()

    # Second: new frontend connects and gets buffer
    with client.websocket_connect(f"/api/pulse/ws/pulse/{patient_id}") as frontend_ws:
        buffer_msg = frontend_ws.receive_json()
        assert buffer_msg["type"] == "buffer"
        assert len(buffer_msg["samples"]) > 0
        assert len(buffer_msg["samples"]) <= 50


# ---------------------------------------------------------------------------
# Batch writer persistence tests
# ---------------------------------------------------------------------------

def test_batch_writer_flushes_to_db(client, app_with_db, db_engine):
    """Samples persist to DB after batch writer flush."""
    from sqlalchemy.orm import Session
    from app.models.pulse import PulseSample

    patient_id = str(app_with_db["patient_id"])

    with client.websocket_connect(f"/api/pulse/ws/device/test-device-006") as ws:
        ws.send_json({
            "type": "register",
            "device_id": "test-device-006",
            "patient_id": patient_id,
        })
        ws.receive_json()

        # Send enough samples to trigger threshold flush (500+)
        for i in range(10):
            samples = [float(j) for j in range(50)]
            ws.send_json({
                "type": "samples",
                "samples": samples,
            })
            ws.receive_json()

    # Wait for batch writer flush
    import time
    time.sleep(1.5)

    # Check DB for samples
    with Session(db_engine) as session:
        count = session.query(PulseSample).filter(
            PulseSample.session_id == app_with_db["session_id"]
        ).count()
        assert count >= 100, f"Expected >= 100 samples in DB, got {count}"


def test_session_created_on_register(client, app_with_db):
    """PulseSession is tracked when device registers."""
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-007") as ws:
        ws.send_json({
            "type": "register",
            "device_id": "test-device-007",
            "patient_id": str(app_with_db["patient_id"]),
        })
        resp = ws.receive_json()

        # Session should be tracked
        assert "test-device-007" in manager.device_sessions
        session_id = manager.device_sessions["test-device-007"]
        assert session_id is not None


def test_device_disconnect_cleanup(client, app_with_db):
    """Device is cleaned up on disconnect."""
    ws = client.websocket_connect(f"/api/pulse/ws/device/test-device-008").__enter__()
    ws.send_json({
        "type": "register",
        "device_id": "test-device-008",
        "patient_id": str(app_with_db["patient_id"]),
    })
    ws.receive_json()

    # Send samples
    ws.send_json({
        "type": "samples",
        "samples": [1.0, 2.0, 3.0],
    })
    ws.receive_json()

    # Disconnect
    ws.close()

    # Device should be removed from active connections
    assert "test-device-008" not in manager.device_connections


def test_multiple_batches_all_persisted(client, app_with_db, db_engine):
    """Multiple small batches all get persisted."""
    from sqlalchemy.orm import Session
    from app.models.pulse import PulseSample

    patient_id = str(app_with_db["patient_id"])

    with client.websocket_connect(f"/api/pulse/ws/device/test-device-009") as ws:
        ws.send_json({
            "type": "register",
            "device_id": "test-device-009",
            "patient_id": patient_id,
        })
        ws.receive_json()

        total_samples = 0
        for i in range(20):
            batch = [float(j + i * 10) for j in range(10)]
            ws.send_json({
                "type": "samples",
                "samples": batch,
            })
            ws.receive_json()
            total_samples += len(batch)

    # Force flush
    if "test-device-009" in manager.device_sessions:
        session_id = manager.device_sessions["test-device-009"]
        import asyncio
        asyncio.get_event_loop().run_until_complete(
            batch_writer.flush_session(session_id)
        )

    import time
    time.sleep(0.3)

    with Session(db_engine) as session:
        count = session.query(PulseSample).filter(
            PulseSample.session_id == app_with_db["session_id"]
        ).count()
        assert count == total_samples, f"Expected {total_samples} samples, got {count}"


# ---------------------------------------------------------------------------
# Device manager API test
# ---------------------------------------------------------------------------

def test_device_list_endpoint(client, app_with_db):
    """GET /api/devices/ returns connected devices."""
    with client.websocket_connect(f"/api/pulse/ws/device/test-device-010") as ws:
        ws.send_json({
            "type": "register",
            "device_id": "test-device-010",
            "patient_id": str(app_with_db["patient_id"]),
        })
        ws.receive_json()

        # Query device list via HTTP
        resp = client.get("/api/devices/")
        assert resp.status_code == 200
        devices = resp.json()
        assert isinstance(devices, list)
        assert len(devices) >= 1
        device_ids = [d["device_id"] for d in devices]
        assert "test-device-010" in device_ids
