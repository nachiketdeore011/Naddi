# Firmware - ESP32 Nadi Sensor (WebSocket Mode)

## Overview
Streams pulse data in real-time from the MAX30102 sensor to the backend
via WebSocket connection. Samples are sent every 100ms in batches of 10.

## Data Flow
```
MAX30102 PPG Sensor --> ESP32 --> WebSocket --> Backend --> PostgreSQL
                                                    |
                                                    v
                                              Frontend (Live Chart)
```

## Hardware Requirements
- ESP32 DevKit v1
- MAX30102 Pulse Oximeter & Heart Rate Sensor Module
- Jumper wires

## Wiring
| MAX30102 | ESP32 |
|----------|-------|
| SDA      | GPIO 21 |
| SCL      | GPIO 22 |
| VCC      | 3.3V |
| GND      | GND |

## Setup
1. Install [PlatformIO](https://platformio.org/)
2. Create a `.env` file with your WiFi credentials:
   ```
   WIFI_SSID=your_wifi_name
   WIFI_PASS=your_wifi_password
   API_HOST=192.168.1.100
   ```
3. Connect ESP32 via USB
4. Upload: `pio run --target upload`
5. Monitor: `pio device monitor`

## WebSocket Protocol

### Connection
Device connects to: `ws://{API_HOST}:8000/api/pulse/ws/device/{device_id}`

### Messages (Device -> Server)

**Registration** (sent on connect):
```json
{
  "type": "register",
  "patient_id": "patient-uuid",
  "sample_rate": 100
}
```

**Sample Data** (sent every 100ms):
```json
{
  "patient_id": "patient-uuid",
  "samples": [123456.0, 124000.0, ...],
  "sample_rate": 100
}
```

### Messages (Server -> Device)

**Registration Acknowledgement:**
```json
{
  "type": "registered",
  "session_id": "session-uuid",
  "device_id": "AA11BB22CC33",
  "patient_id": "patient-uuid"
}
```

**Sample Acknowledgement:**
```json
{
  "type": "ack",
  "samples_received": 10
}
```

**Config Update** (server can change patient_id):
```json
{
  "type": "config",
  "patient_id": "new-patient-uuid"
}
```

## Device ID
Device ID is automatically generated from the last 12 characters of the ESP32's MAC address (without colons).
