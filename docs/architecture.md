# System Architecture

## Overview

```
┌──────────────┐     HTTP/MQTT      ┌──────────────┐     gRPC/REST    ┌──────────────┐
│              │ ─────────────────▶ │              │ ───────────────▶ │              │
│  IoT Device  │                    │   Backend    │                   │   Frontend   │
│  (ESP32 +    │                    │   (FastAPI)  │                   │   (React)    │
│  MAX30102)   │                    │              │ ◀─────────────── │              │
│              │                    │              │                   │              │
└──────────────┘                    └──────┬───────┘                   └──────────────┘
                                           │
                                           │ REST
                                           ▼
                                    ┌──────────────┐
                                    │  ML Service  │
                                    │  (Python)    │
                                    └──────────────┘
```

## Data Flow

### 1. Signal Acquisition (Firmware)
- MAX30102 PPG sensor captures raw optical pulse data at 100Hz sampling rate
- ESP32 preprocesses signal (basic filtering) and packages data in JSON format
- Data transmitted via HTTP POST to backend every 5 seconds (batch of 500 samples)

### 2. Data Ingestion (Backend)
- FastAPI receives pulse data with patient metadata
- Validates and stores raw signals in PostgreSQL
- Triggers async ML analysis pipeline
- Maintains patient records and session history

### 3. Signal Processing & Analysis (ML)
- **Preprocessing:** Bandpass filter (0.5-8Hz), baseline wander removal, normalization
- **Feature Extraction:** Heart rate, pulse wave velocity, signal morphology features
- **Classification:** Trained model identifies pulse patterns based on Nadi classification

### 4. Visualization (Frontend)
- Real-time pulse waveform display
- Health metric cards (heart rate, SpO2, pulse quality)
- Historical trends and comparison charts
- Patient profile and session management

## Database Schema

### patients
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Patient name |
| age | INTEGER | Age |
| gender | VARCHAR(20) | Gender |
| created_at | TIMESTAMP | Registration date |

### pulse_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | FK → patients |
| started_at | TIMESTAMP | Session start |
| duration_sec | FLOAT | Duration in seconds |
| status | VARCHAR(20) | completed/in_progress |

### pulse_samples
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → pulse_sessions |
| timestamp | TIMESTAMP | Sample timestamp |
| red_value | FLOAT | Red LED reading |
| ir_value | FLOAT | Infrared LED reading |
| spo2 | FLOAT | SpO2 percentage |

### analysis_results
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → pulse_sessions |
| heart_rate | FLOAT | BPM |
| pulse_pattern | VARCHAR(50) | Nadi classification |
| confidence | FLOAT | Model confidence |
| recommendations | TEXT | AI-generated insights |
| analyzed_at | TIMESTAMP | Analysis timestamp |
