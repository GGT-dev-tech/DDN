"""add_contract_schedule

Revision ID: b2c3d4e5f601
Revises: 9ab3b44b8293
Create Date: 2026-08-21 21:35:00.000000

"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f601'
down_revision: str | Sequence[str] | None = '9ab3b44b8293'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

def upgrade() -> None:
    op.add_column('contracts_contracts', sa.Column('service_schedule', sa.JSON(), nullable=True))

def downgrade() -> None:
    op.drop_column('contracts_contracts', 'service_schedule')
