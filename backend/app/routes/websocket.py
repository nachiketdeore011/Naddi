"""WebSocket endpoint for real-time pulse data streaming."""

import json
import time as _time
from typing import Dict, Set, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database.connection import SessionLocal
from app.models.pulse import PulseSession
from app.services.batch_writer import batch_writer

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.frontend_connections: Dict[str, Set[WebSocket]] = {}
        self.device_connections: Dict[str, WebSocket] = {}
        self.sample_buffers: Dict[str, list] = {}
        self.max_buffer_size = 2000
        self.device_patient_map: Dict[str, str] = {}
        self.device_sessions: Dict[str, str] = {}

    async def connect_device(self, websocket, device_id):
        await websocket.accept()
        self.device_connections[device_id] = websocket

    async def disconnect_device(self, device_id):
        self.device_connections.pop(device_id, None)
        session_id = self.device_sessions.pop(device_id, None)
        if session_id:
            await batch_writer.flush_session(session_id)
            self._end_session(session_id)

    async def connect_frontend(self, websocket, patient_id):
        await websocket.accept()
        if patient_id not in self.frontend_connections:
            self.frontend_connections[patient_id] = set()
        self.frontend_connections[patient_id].add(websocket)
        if patient_id in self.sample_buffers:
            recent = self.sample_buffers[patient_id][-500:]
            await websocket.send_json({"type": "buffer", "samples": recent})

    async def disconnect_frontend(self, websocket, patient_id):
        if patient_id in self.frontend_connections:
            self.frontend_connections[patient_id].discard(websocket)
            if not self.frontend_connections[patient_id]:
                del self.frontend_connections[patient_id]

    async def register_device(self, device_id, patient_id, sample_rate=100):
        self.device_patient_map[device_id] = patient_id
        session_id = self._create_session(patient_id, device_id, sample_rate)
        if session_id:
            self.device_sessions[device_id] = session_id
        return session_id

    async def broadcast_samples(self, patient_id, samples, device_id=""):
        if patient_id not in self.sample_buffers:
            self.sample_buffers[patient_id] = []
        buf = self.sample_buffers[patient_id]
        buf.extend(samples)
        if len(buf) > self.max_buffer_size:
            self.sample_buffers[patient_id] = buf[-self.max_buffer_size:]
        session_id = self.device_sessions.get(device_id)
        if session_id:
            batch_writer.enqueue(session_id, samples)
        if patient_id in self.frontend_connections:
            dead = []
            for ws in self.frontend_connections[patient_id]:
                try:
                    await ws.send_json({"type": "samples", "device_id": device_id, "samples": samples, "timestamp": _time.time()})
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.frontend_connections[patient_id].discard(ws)

    def _create_session(self, patient_id, device_id, sample_rate):
        try:
            db = SessionLocal()
            session = PulseSession(patient_id=patient_id, device_id=device_id, sample_rate=sample_rate, status="in_progress")
            db.add(session)
            db.commit()
            db.refresh(session)
            session_id = str(session.id)
            db.close()
            return session_id
        except Exception as e:
            return None

    def _end_session(self, session_id):
        try:
            db = SessionLocal()
            session = db.query(PulseSession).filter(PulseSession.id == session_id).first()
            if session:
                session.status = "completed"
                db.commit()
            db.close()
        except Exception:
            pass

    def get_device_list(self):
        devices = []
        for device_id, ws in self.device_connections.items():
            patient_id = self.device_patient_map.get(device_id, "unknown")
            session_id = self.device_sessions.get(device_id)
            buffer_size = len(self.sample_buffers.get(patient_id, []))
            devices.append({"device_id": device_id, "patient_id": patient_id, "session_id": session_id, "connected": True, "samples_buffered": buffer_size})
        for device_id, session_id in self.device_sessions.items():
            if device_id not in self.device_connections:
                patient_id = self.device_patient_map.get(device_id, "unknown")
                devices.append({"device_id": device_id, "patient_id": patient_id, "session_id": session_id, "connected": False, "samples_buffered": 0})
        return devices


manager = ConnectionManager()


@router.websocket("/ws/device/{device_id}")
async def device_websocket(websocket: WebSocket, device_id: str):
    await manager.connect_device(websocket, device_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")
            if msg_type == "register":
                patient_id = data.get("patient_id", "default")
                sample_rate = data.get("sample_rate", 100)
                session_id = await manager.register_device(device_id, patient_id, sample_rate)
                await websocket.send_json({"type": "registered", "session_id": session_id, "device_id": device_id, "patient_id": patient_id})
            else:
                patient_id = data.get("patient_id", "default")
                samples = data.get("samples", [])
                if device_id not in manager.device_patient_map:
                    await manager.register_device(device_id, patient_id, 100)
                if samples:
                    await manager.broadcast_samples(patient_id, samples, device_id)
                    await websocket.send_json({"type": "ack", "samples_received": len(samples)})
    except WebSocketDisconnect:
        await manager.disconnect_device(device_id)
    except Exception as e:
        await manager.disconnect_device(device_id)


@router.websocket("/ws/pulse/{patient_id}")
async def frontend_websocket(websocket: WebSocket, patient_id: str):
    await manager.connect_frontend(websocket, patient_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            cmd = msg.get("type")
            if cmd == "ping":
                await websocket.send_json({"type": "pong"})
            elif cmd == "trigger_analysis":
                await websocket.send_json({"type": "info", "message": "Analysis triggered"})
    except WebSocketDisconnect:
        await manager.disconnect_frontend(websocket, patient_id)
    except Exception as e:
        await manager.disconnect_frontend(websocket, patient_id)


def get_connection_manager():
    return manager