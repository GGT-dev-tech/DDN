"""enable_rls_for_roles

Revision ID: 1cbc00ecbb15
Revises: 4d3d9f037547
Create Date: 2026-07-17 01:48:00.349494

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '1cbc00ecbb15'
down_revision: str | Sequence[str] | None = '4d3d9f037547'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE roles ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation_policy ON roles
        USING (
            current_setting('app.current_tenant_id', true) IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id')::uuid
        );
    """)

    # We also want to protect role_permissions, but it doesn't have tenant_id directly.
    # It references role_id.
    op.execute("ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation_policy_role_perms ON role_permissions
        USING (
            current_setting('app.current_tenant_id', true) IS NOT NULL
            AND role_id IN (
                SELECT id FROM roles 
                WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
            )
        );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy_role_perms ON role_permissions;")
    op.execute("ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;")
    
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON roles;")
    op.execute("ALTER TABLE roles DISABLE ROW LEVEL SECURITY;")
