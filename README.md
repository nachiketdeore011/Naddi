# 🫀 Nadi Diagnosis System

An IoT- and AI-based Nadi Pariksha (pulse diagnosis) system that captures, processes, and analyzes pulse signals to provide consistent, data-driven health insights.

## 🏗️ Architecture

The system consists of four main components:

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Firmware** | ESP32 + MAX30102 | Captures PPG pulse signals from the wrist |
| **Backend** | FastAPI + PostgreSQL | REST API for data ingestion, storage, and serving |
| **ML Pipeline** | Python + scikit-learn | Signal preprocessing, feature extraction, and classification |
| **Frontend** | React + TypeScript | Real-time dashboard for visualization and records |

See [docs/architecture.md](docs/architecture.md) for the detailed system design.

## 📁 Project Structure

```
nadi-diagnosis-system/
├── firmware/              # ESP32 firmware (PlatformIO)
├── backend/               # FastAPI backend service
├── ml/                    # Machine learning pipeline
├── frontend/              # React dashboard
├── nginx/                 # Dev reverse proxy config
├── traefik/               # Production HTTPS proxy config
├── docs/                  # Documentation
├── docker-compose.yml     # Dev stack (with nginx proxy)
├── docker-compose.prod.yml # Prod stack (with Traefik + TLS)
└── .env.example           # Environment variable template
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PlatformIO (for firmware)

### Running with Docker

**Development (hot-reload):**
```bash
docker compose up --build
```

**Production (multi-stage builds, resource limits):**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Development** uses an nginx reverse proxy at `http://localhost` that routes:
- `/api/*` → backend (FastAPI)
- `/ws/*` → backend (WebSocket)
- `/*` → frontend (Vite dev server with HMR)

Services wait for their dependencies to be healthy before starting:
- `db` → PostgreSQL readiness (pg_isready)
- `ml` → ML service /health endpoint
- `backend` → /api/health endpoint (waits for db + ml)
- `frontend` → Vite dev server ready
- `nginx` → waits for backend + frontend

**Production** (with Traefik + automatic HTTPS):
```bash
cp .env.example .env       # fill in DOMAIN + ACME_EMAIL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Production uses Traefik as a reverse proxy with:
- Automatic TLS certificates via Let's Encrypt (HTTP challenge)
- HTTP → HTTPS redirect
- Security headers (HSTS, XSS protection, etc.)
- Rate limiting and compression
- Health-checked routing to backend + frontend

Traefik dashboard available at `https://traefik.<your-domain>/dashboard/`

### Running individually

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations first
./migrate.sh up

# Start dev server
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**ML Pipeline:**
```bash
cd ml
pip install -r requirements.txt
python -m src.train --data data/ --output models/
```

**Firmware:**
```bash
cd firmware
pio run --target upload
```

## 🗄️ Database Migrations

This project uses **Alembic** for database schema migrations. The backend runs migrations automatically on startup.

### Common Commands

```bash
# Run all pending migrations
./migrate.sh up

# Rollback last migration
./migrate.sh down

# Show migration history
./migrate.sh history

# Show current revision
./migrate.sh current

# Generate new migration after model changes
./migrate.sh generate "add user preferences table"

# Stamp current state (mark as up-to-date without running)
./migrate.sh stamp head
```

### Creating a New Migration

1. Update models in `backend/app/models/`
2. Generate migration: `./migrate.sh generate "description"`
3. Review the generated file in `backend/alembic/versions/`
4. Test upgrade/downgrade
5. Commit the migration file

### Docker

```bash
# Run migrations manually in Docker
docker compose run --rm migrate

# Or let the backend run them on startup (automatic)
docker compose up backend
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/patients` | Register a new patient |
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/patients/{id}` | Get patient details |
| `POST` | `/api/pulse/upload` | Upload pulse data from IoT device |
| `GET` | `/api/pulse/{patient_id}` | Get pulse history for a patient |
| `POST` | `/api/pulse/analyze` | Run ML analysis on pulse data |
| `GET` | `/api/health/{patient_id}` | Get health summary |

## ⚠️ Disclaimer

This system is designed as a **supportive health monitoring tool** and is NOT a substitute for professional medical diagnosis or treatment. Always consult qualified healthcare professionals for medical decisions.
