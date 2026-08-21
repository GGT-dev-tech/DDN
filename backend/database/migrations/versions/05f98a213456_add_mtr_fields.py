"""Add usage_type and expiration_date to WasteManifest

Revision ID: 05f98a213456
Revises: e88bc9a45d7c
Create Date: 2026-08-21 04:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '05f98a213456'
down_revision: Union[str, Sequence[str], None] = 'e88bc9a45d7c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create the new Enum type using postgresql dialect directly
    usage_type_enum = postgresql.ENUM('SINGLE_USE', 'MULTIPLE_USE', name='mtrusagetype')
    usage_type_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add columns to compliance_waste_manifests
    op.add_column('compliance_waste_manifests', sa.Column('expiration_date', sa.Date(), nullable=True))
    op.add_column('compliance_waste_manifests', sa.Column('usage_type', usage_type_enum, server_default='SINGLE_USE', nullable=False))
    op.add_column('compliance_waste_manifests', sa.Column('current_usages', sa.Integer(), server_default='0', nullable=False))

    # 3. Alter service_order_id to be nullable
    op.alter_column('compliance_waste_manifests', 'service_order_id', existing_type=sa.UUID(), nullable=True)

def downgrade() -> None:
    op.alter_column('compliance_waste_manifests', 'service_order_id', existing_type=sa.UUID(), nullable=False)
    op.drop_column('compliance_waste_manifests', 'current_usages')
    op.drop_column('compliance_waste_manifests', 'usage_type')
    op.drop_column('compliance_waste_manifests', 'expiration_date')
    
    # Optionally drop the enum if we are sure it's not used elsewhere
    usage_type_enum = postgresql.ENUM('SINGLE_USE', 'MULTIPLE_USE', name='mtrusagetype')
    usage_type_enum.drop(op.get_bind(), checkfirst=True)
