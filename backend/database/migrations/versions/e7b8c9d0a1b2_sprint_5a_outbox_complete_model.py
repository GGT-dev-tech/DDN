"""sprint_5a_outbox_complete_model

Revision ID: e7b8c9d0a1b2
Revises: a8f9cd91e876
Create Date: 2026-07-24 05:13:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e7b8c9d0a1b2'
down_revision: Union[str, None] = 'a8f9cd91e876'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # We are updating outbox_events to include the new fields
    op.add_column('outbox_events', sa.Column('tenant_id', sa.Uuid(), nullable=True))
    op.add_column('outbox_events', sa.Column('aggregate_type', sa.String(), nullable=False, server_default='unknown'))
    op.add_column('outbox_events', sa.Column('event_name', sa.String(), nullable=False, server_default='unknown'))
    op.add_column('outbox_events', sa.Column('headers', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'))
    op.add_column('outbox_events', sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('outbox_events', sa.Column('max_attempts', sa.Integer(), nullable=False, server_default='3'))
    op.add_column('outbox_events', sa.Column('available_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    op.add_column('outbox_events', sa.Column('locked_at', sa.DateTime(), nullable=True))
    op.add_column('outbox_events', sa.Column('worker_id', sa.String(), nullable=True))
    op.add_column('outbox_events', sa.Column('correlation_id', sa.String(), nullable=False, server_default='unknown'))
    op.add_column('outbox_events', sa.Column('causation_id', sa.String(), nullable=True))
    op.add_column('outbox_events', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    
    op.create_index(op.f('ix_outbox_events_tenant_id'), 'outbox_events', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_outbox_events_available_at'), 'outbox_events', ['available_at'], unique=False)

    # Note: If migrating a real DB with data, we might need to handle event_type -> event_name data migration, 
    # but since this is dev phase, we just drop the old column and use the new one.
    op.drop_column('outbox_events', 'event_type')
    op.drop_column('outbox_events', 'metadata_json')
    op.drop_column('outbox_events', 'retry_count')
    op.drop_column('outbox_events', 'aggregate_name')

def downgrade() -> None:
    op.add_column('outbox_events', sa.Column('aggregate_name', sa.VARCHAR(), autoincrement=False, nullable=False, server_default='unknown'))
    op.add_column('outbox_events', sa.Column('retry_count', sa.INTEGER(), autoincrement=False, nullable=False, server_default='0'))
    op.add_column('outbox_events', sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=False, server_default='{}'))
    op.add_column('outbox_events', sa.Column('event_type', sa.VARCHAR(), autoincrement=False, nullable=False, server_default='unknown'))
    
    op.drop_index(op.f('ix_outbox_events_available_at'), table_name='outbox_events')
    op.drop_index(op.f('ix_outbox_events_tenant_id'), table_name='outbox_events')
    
    op.drop_column('outbox_events', 'updated_at')
    op.drop_column('outbox_events', 'causation_id')
    op.drop_column('outbox_events', 'correlation_id')
    op.drop_column('outbox_events', 'worker_id')
    op.drop_column('outbox_events', 'locked_at')
    op.drop_column('outbox_events', 'available_at')
    op.drop_column('outbox_events', 'max_attempts')
    op.drop_column('outbox_events', 'attempts')
    op.drop_column('outbox_events', 'headers')
    op.drop_column('outbox_events', 'event_name')
    op.drop_column('outbox_events', 'aggregate_type')
    op.drop_column('outbox_events', 'tenant_id')
