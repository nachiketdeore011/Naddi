"""Initial schema — patients, pulse sessions, samples, analysis results

Revision ID: 0001
Revises: None
Create Date: 2026-08-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── patients ──
    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("age", sa.Integer, nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # ── pulse_sessions ──
    op.create_table(
        "pulse_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "patient_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("patients.id"),
            nullable=False,
        ),
        sa.Column("device_id", sa.String(100), nullable=True),
        sa.Column("started_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime, nullable=True),
        sa.Column("duration_sec", sa.Float, nullable=True),
        sa.Column("sample_rate", sa.Integer, server_default="100"),
        sa.Column("status", sa.String(20), server_default="in_progress"),
    )
    op.create_index(
        "ix_pulse_sessions_patient_id",
        "pulse_sessions",
        ["patient_id"],
    )
    op.create_index(
        "ix_pulse_sessions_status",
        "pulse_sessions",
        ["status"],
    )

    # ── pulse_samples ──
    op.create_table(
        "pulse_samples",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("pulse_sessions.id"),
            nullable=False,
        ),
        sa.Column("timestamp", sa.DateTime, server_default=sa.func.now()),
        sa.Column("red_value", sa.Float, nullable=True),
        sa.Column("ir_value", sa.Float, nullable=False),
        sa.Column("spo2", sa.Float, nullable=True),
    )
    op.create_index(
        "ix_pulse_samples_session_id",
        "pulse_samples",
        ["session_id"],
    )
    op.create_index(
        "ix_pulse_samples_timestamp",
        "pulse_samples",
        ["timestamp"],
    )

    # ── analysis_results ──
    op.create_table(
        "analysis_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("pulse_sessions.id"),
            nullable=False,
        ),
        sa.Column("heart_rate", sa.Float, nullable=True),
        sa.Column("pulse_pattern", sa.String(50), nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("sp02", sa.Float, nullable=True),
        sa.Column("recommendations", sa.Text, nullable=True),
        sa.Column("analyzed_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index(
        "ix_analysis_results_session_id",
        "analysis_results",
        ["session_id"],
    )


def downgrade() -> None:
    op.drop_table("analysis_results")
    op.drop_table("pulse_samples")
    op.drop_table("pulse_sessions")
    op.drop_table("patients")
