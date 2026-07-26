"""enable_rls_for_audit_logs

Revision ID: cd5121057669
Revises: 60356a8711d8
Create Date: 2026-07-17 01:49:37.974702

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'cd5121057669'
down_revision: str | Sequence[str] | None = '60356a8711d8'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation_policy ON audit_logs
        USING (
            current_setting('app.current_tenant_id', true) IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id')::uuid
        );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON audit_logs;")
    op.execute("ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;")
