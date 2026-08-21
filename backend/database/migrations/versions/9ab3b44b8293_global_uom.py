"""global_uom

Revision ID: 9ab3b44b8293
Revises: 13b45c67d890
Create Date: 2026-08-21 05:11:00.000000

"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9ab3b44b8293'
down_revision: str | Sequence[str] | None = '13b45c67d890'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

def upgrade() -> None:
    # Drop RLS policy
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON catalog_units_of_measure;")
    op.execute("ALTER TABLE catalog_units_of_measure DISABLE ROW LEVEL SECURITY;")
    
    # Drop index and column
    op.drop_index('ix_catalog_units_of_measure_tenant_id', table_name='catalog_units_of_measure')
    op.drop_column('catalog_units_of_measure', 'tenant_id')
    
    # Add unique constraint
    op.create_unique_constraint('uq_catalog_units_of_measure_symbol', 'catalog_units_of_measure', ['symbol'])

def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_catalog_units_of_measure_symbol', 'catalog_units_of_measure', type_='unique')
    
    # Add column back
    op.add_column('catalog_units_of_measure', sa.Column('tenant_id', sa.Uuid(), nullable=True))
    op.create_index('ix_catalog_units_of_measure_tenant_id', 'catalog_units_of_measure', ['tenant_id'], unique=False)
    
    # We would need to set tenant_id on existing rows, but for downgrade we just make it nullable or dummy.
    # Enable RLS back
    op.execute("ALTER TABLE catalog_units_of_measure ENABLE ROW LEVEL SECURITY;")
    op.execute(
        "CREATE POLICY tenant_isolation_policy ON catalog_units_of_measure "
        "USING (tenant_id = current_setting('app.current_tenant_id')::uuid);"
    )
