"""
Device management routes.

Provides endpoints to list connected IoT devices and their status.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.routes.websocket import get_connection_manager

router = APIRouter()


class DeviceStatus(BaseModel):
    device_id: str
    patient_id: str
    session_id: str | None
    connected: bool
    samples_buffered: int


class DevicesResponse(BaseModel):
    connected_count: int
    devices: list[DeviceStatus]


@router.get("/", response_model=DevicesResponse)
async def list_devices():
    """List all connected IoT devices and their status.

    Returns the current state of the WebSocket connection manager,
    showing which devices are connected, which patients they are
    assigned to, and how many samples are buffered.
    """
    manager = get_connection_manager()
    devices = []

    # Include currently connected devices
    for device_id, ws in manager.device_connections.items():
        patient_id = manager.device_patient_map.get(device_id, "unknown")
        session_id = manager.device_sessions.get(device_id)
        buffer_size = len(manager.sample_buffers.get(patient_id, []))

        devices.append(DeviceStatus(
            device_id=device_id,
            patient_id=patient_id,
            session_id=session_id,
            connected=True,
            samples_buffered=buffer_size,
        ))

    # Also include recently disconnected devices that had sessions
    for device_id, session_id in manager.device_sessions.items():
        if device_id not in manager.device_connections:
            patient_id = manager.device_patient_map.get(device_id, "unknown")
            devices.append(DeviceStatus(
                device_id=device_id,
                patient_id=patient_id,
                session_id=session_id,
                connected=False,
                samples_buffered=0,
            ))

    return DevicesResponse(
        connected_count=len([d for d in devices if d.connected]),
        devices=devices,
    )
