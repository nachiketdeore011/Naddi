"""
Alembic Environment Configuration

This file configures Alembic to:
- Use the same database URL as the application
- Import all models for autogenerate support
- Support both online (real DB) and offline modes
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Add the parent directory to sys.path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ── Alembic Config Object ──
config = context.config

# Setup Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import Models for Autogenerate ──
# Import ALL models here so Alembic can detect them for --autogenerate
from app.models.patient import Patient  # noqa: F401
from app.models.pulse import PulseSession, PulseSample, AnalysisResult  # noqa: F401
from app.database.connection import Base

# Set target metadata for autogenerate
target_metadata = Base.metadata

# ── Get Database URL ──
# Priority: DATABASE_URL env var > alembic.ini sqlalchemy.url
def get_url():
    """Get database URL from environment or config file."""
    return os.getenv(
        "DATABASE_URL",
        config.get_main_option("sqlalchemy.url") or "postgresql://nadi:nadi@localhost:5432/nadi_db"
    )


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This configures the context with just a URL and not an Engine.
    Calls to context.execute() here emit the given string to the
    script output without connecting to a database.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    Creates an Engine and associates a connection with the context.
    """
    url = get_url()
    
    # Override sqlalchemy.url with our runtime URL
    config.set_main_option("sqlalchemy.url", url)
    
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
