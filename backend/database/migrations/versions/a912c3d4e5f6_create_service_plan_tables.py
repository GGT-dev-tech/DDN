"""create service plan tables

Revision ID: a912c3d4e5f6
Revises: f401d42e98ed
Create Date: 2026-07-27 15:53:00.000000

Tables:
    service_plan_plans    — Aggregate Root
    service_plan_schedules — Internal Entity (no standalone repository)

Design notes:
    - version column enables optimistic locking in the repository.
    - collection_point and recurrence stored as JSONB (Value Objects).
    - Both tables protected by RLS via tenant_id.
    - Enum types created before tables to avoid dependency issues.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

# revision identifiers, used by Alembic.
revision: str = "a912c3d4e5f6"
down_revision: Union[str, None] = "f401d42e98ed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Enum types ---
    serviceplanstatus = sa.Enum(
        "DRAFT", "ACTIVE", "SUSPENDED", "TERMINATED",
        name="serviceplanstatus",
    )
    schedulestatus = sa.Enum(
        "ACTIVE", "PAUSED", "REMOVED",
        name="schedulestatus",
    )
    # serviceplanstatus.create(op.get_bind(), checkfirst=True)
    # schedulestatus.create(op.get_bind(), checkfirst=True)

    # --- service_plan_plans ---
    op.create_table(
        "service_plan_plans",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("tenant_id", UUID(as_uuid=True), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True), nullable=False),
        sa.Column("contract_id", UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "DRAFT", "ACTIVE", "SUSPENDED", "TERMINATED",
                name="serviceplanstatus",
                create_type=False,
            ),
            nullable=False,
            server_default="DRAFT",
        ),
        sa.Column("effective_date", sa.Date, nullable=False),
        sa.Column("expiration_date", sa.Date, nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_sp_plans_tenant_id", "service_plan_plans", ["tenant_id"])
    op.create_index("ix_sp_plans_company_id", "service_plan_plans", ["company_id"])
    op.create_index("ix_sp_plans_contract_id", "service_plan_plans", ["contract_id"])

    # RLS for service_plan_plans
    op.execute("""
        ALTER TABLE service_plan_plans ENABLE ROW LEVEL SECURITY;
        CREATE POLICY tenant_isolation_sp_plans ON service_plan_plans
            USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
    """)

    # --- service_plan_schedules ---
    op.create_table(
        "service_plan_schedules",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "plan_id",
            UUID(as_uuid=True),
            sa.ForeignKey("service_plan_plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("service_offering_id", UUID(as_uuid=True), nullable=False),
        sa.Column("service_name", sa.String(255), nullable=False),
        sa.Column("quantity_snapshot", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("collection_point", JSONB, nullable=True),
        sa.Column("recurrence", JSONB, nullable=True),

        sa.Column(
            "status",
            sa.Enum(
                "ACTIVE", "PAUSED", "REMOVED",
                name="schedulestatus",
                create_type=False,
            ),
            nullable=False,
            server_default="ACTIVE",
        ),
        sa.Column("notes", sa.Text, nullable=True),
    )
    op.create_index(
        "ix_sp_schedules_plan_id", "service_plan_schedules", ["plan_id"]
    )

    # RLS for service_plan_schedules (join-based via plan)
    op.execute("""
        ALTER TABLE service_plan_schedules ENABLE ROW LEVEL SECURITY;
        CREATE POLICY tenant_isolation_sp_schedules ON service_plan_schedules
            USING (
                plan_id IN (
                    SELECT id FROM service_plan_plans
                    WHERE tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid
                )
            );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation_sp_schedules ON service_plan_schedules;")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_sp_plans ON service_plan_plans;")
    op.drop_table("service_plan_schedules")
    op.drop_table("service_plan_plans")
    op.execute("DROP TYPE IF EXISTS schedulestatus;")
    op.execute("DROP TYPE IF EXISTS serviceplanstatus;")
