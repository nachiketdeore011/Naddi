"""
Simulator endpoint for testing real-time pulse streaming
without an actual IoT device.

Generates synthetic PPG signals and broadcasts them via WebSocket,
simulating a device connection.
"""

import asyncio
import math
import random

from fastapi import APIRouter

from app.routes.websocket import get_connection_manager

router = APIRouter()


async def simulate_pulse(patient_id: str, duration_sec: float = 60.0, sample_rate: int = 100):
    """Generate synthetic pulse data and stream it to connected frontends."""
    manager = get_connection_manager()
    total_samples = int(duration_sec * sample_rate)

    # Pick random physiological parameters
    heart_rate = random.uniform(65, 95)
    amplitude = random.uniform(0.3, 0.7)
    noise_level = random.uniform(0.01, 0.03)

    beat_period = 60.0 / heart_rate

    print(f"[SIM] Streaming to patient {patient_id}, HR={heart_rate:.0f} BPM, {duration_sec}s")

    # Register as a virtual device
    device_id = f"sim-{patient_id[:8]}"
    await manager.register_device(device_id, patient_id, sample_rate)

    batch = []
    t = 0.0

    for i in range(total_samples):
        t = i / sample_rate
        beat_t = t % beat_period

        # PPG waveform: systolic peak + dicrotic notch + diastolic bump
        systolic = amplitude * math.exp(-0.5 * ((beat_t - 0.2 * beat_period) / (0.1 * beat_period)) ** 2)
        notch = -0.1 * amplitude * math.exp(-0.5 * ((beat_t - 0.45 * beat_period) / (0.05 * beat_period)) ** 2)
        diastolic = 0.2 * amplitude * math.exp(-0.5 * ((beat_t - 0.55 * beat_period) / (0.15 * beat_period)) ** 2)
        baseline = 0.03 * amplitude * math.sin(2 * math.pi * 0.1 * t)
        noise = random.gauss(0, noise_level * amplitude)

        value = systolic + notch + diastolic + baseline + noise
        batch.append(round(value, 6))

        # Send every 50ms worth of samples (5 samples at 100Hz)
        if len(batch) >= 5:
            await manager.broadcast_samples(patient_id, batch, device_id)
            batch = []
            await asyncio.sleep(0.05)

    # Send remaining
    if batch:
        await manager.broadcast_samples(patient_id, batch, device_id)

    # End session
    session_id = manager.device_sessions.get(device_id)
    if session_id:
        manager._end_session(session_id)
        manager.device_sessions.pop(device_id, None)

    print(f"[SIM] Finished for patient {patient_id}")


@router.post("/simulate/{patient_id}")
async def start_simulation(patient_id: str, duration: float = 60.0):
    """Start a pulse simulation for a patient.

    Launches a background task that generates synthetic PPG data
    and broadcasts it via WebSocket to any connected frontend clients.

    The simulator acts as a virtual device, creating a proper pulse
    session in the database that will appear in the patient's history.
    """
    asyncio.create_task(simulate_pulse(patient_id, duration))
    return {
        "status": "started",
        "patient_id": patient_id,
        "duration_sec": duration,
        "message": "Simulation started. Connect a frontend WebSocket to see live data.",
    }
