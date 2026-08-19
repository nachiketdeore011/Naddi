"""
Run Alembic migrations on application startup.

This script is called before the FastAPI server starts
to ensure the database schema is up to date.
"""

import sys
import os

# Ensure we're in the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Add current directory to path
sys.path.insert(0, os.getcwd())

from alembic.config import Config
from alembic import command


def run_migrations():
    """Run all pending Alembic migrations."""
    print("Running database migrations...")
    
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("Migrations completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
        # Don't crash the app — let it start and fail on DB operations
        # This allows graceful degradation if DB is temporarily unavailable
        return False
    
    return True


if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1)
