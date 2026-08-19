#!/bin/bash
# ============================================================
# Database Migration Helper
# ============================================================
# Usage:
#   ./migrate.sh up          — Run all pending migrations
#   ./migrate.sh down        — Rollback last migration
#   ./migrate.sh history     — Show migration history
#   ./migrate.sh current     — Show current revision
#   ./migrate.sh generate "description" — Generate new migration
#   ./migrate.sh stamp head  — Mark current state as up-to-date
# ============================================================

set -e

cd "$(dirname "$0")"

case "${1:-help}" in
    up)
        echo "Running all pending migrations..."
        python run_migrations.py
        ;;
    down)
        echo "Rolling back last migration..."
        alembic downgrade -1
        ;;
    history)
        echo "Migration history:"
        alembic history --verbose
        ;;
    current)
        echo "Current revision:"
        alembic current
        ;;
    generate)
        if [ -z "$2" ]; then
            echo "Usage: ./migrate.sh generate \"description of changes\""
            exit 1
        fi
        echo "Generating migration: $2"
        alembic revision --autogenerate -m "$2"
        ;;
    stamp)
        echo "Stamping head revision..."
        alembic stamp head
        ;;
    *)
        echo "Usage: ./migrate.sh {up|down|history|current|generate|stamp}"
        echo ""
        echo "Commands:"
        echo "  up              Run all pending migrations"
        echo "  down            Rollback last migration"
        echo "  history         Show migration history"
        echo "  current         Show current revision"
        echo "  generate DESC   Generate new migration from model changes"
        echo "  stamp head      Mark current state as up-to-date"
        exit 1
        ;;
esac
