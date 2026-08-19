#!/bin/bash
set -e

echo "=== Nadi Backend Starting ==="

# ── Step 1: Run database migrations ──
echo "Running Alembic migrations..."
python run_migrations.py || {
    echo "WARNING: Migration failed, starting server anyway..."
}

# ── Step 2: Start the application server ──
echo "Starting uvicorn server..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2
