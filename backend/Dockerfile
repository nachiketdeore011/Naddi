# ============================================================
# Stage 1: Build dependencies
# ============================================================
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build-time system deps (psycopg2-binary ships wheels, but
# some packages may need gcc/python-dev in future)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

# Install Python packages into a prefix we can copy cleanly
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ============================================================
# Stage 2: Production image (minimal)
# ============================================================
FROM python:3.11-slim AS production

# Security: run as non-root
RUN groupadd -r nadi && useradd --no-log-init -r -g nadi nadi

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY backend/app/ ./app/

# Copy Alembic config and migrations
COPY backend/alembic.ini .
COPY backend/alembic/ ./alembic/

# Copy migration runner and entrypoint
COPY backend/run_migrations.py .
COPY backend/entrypoint.sh .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Ensure log directories exist and are writable
RUN mkdir -p /app/logs && chown -R nadi:nadi /app

# Non-root user
USER nadi

# Environment: production defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production

EXPOSE 8000

# Healthcheck: hit the built-in /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD-SHELL python -c "import os, urllib.request; urllib.request.urlopen('http://localhost:' + os.getenv('PORT', '8000') + '/api/health')" || exit 1

# Entry point runs migrations then starts server
ENTRYPOINT ["./entrypoint.sh"]
