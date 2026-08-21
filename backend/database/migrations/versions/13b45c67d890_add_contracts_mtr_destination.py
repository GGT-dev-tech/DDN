"""add contracts mtr destination

Revision ID: 13b45c67d890
Revises: 12a34b56c789
Create Date: 2026-08-21 04:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '13b45c67d890'
down_revision = '12a34b56c789'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add new columns to contracts_contracts
    op.add_column('contracts_contracts', sa.Column('mtr_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('contracts_contracts', sa.Column('destination_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('contracts_contracts', sa.Column('auto_generate_service_orders', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    # Remove columns from contracts_contracts
    op.drop_column('contracts_contracts', 'auto_generate_service_orders')
    op.drop_column('contracts_contracts', 'destination_id')
    op.drop_column('contracts_contracts', 'mtr_id')
