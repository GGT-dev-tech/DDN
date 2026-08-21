"""Add freight to quotations

Revision ID: 12a34b56c789
Revises: 05f98a213456
Create Date: 2026-08-21 04:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '12a34b56c789'
down_revision: Union[str, Sequence[str], None] = '05f98a213456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to quotations_quotations
    op.add_column('quotations_quotations', sa.Column('destination_id', sa.UUID(as_uuid=True), nullable=True))
    op.add_column('quotations_quotations', sa.Column('mtr_id', sa.UUID(as_uuid=True), nullable=True))
    op.add_column('quotations_quotations', sa.Column('freight_distance', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('quotations_quotations', sa.Column('freight_cost', sa.Numeric(precision=15, scale=4), nullable=True))


def downgrade() -> None:
    # Drop columns from quotations_quotations
    op.drop_column('quotations_quotations', 'freight_cost')
    op.drop_column('quotations_quotations', 'freight_distance')
    op.drop_column('quotations_quotations', 'mtr_id')
    op.drop_column('quotations_quotations', 'destination_id')
