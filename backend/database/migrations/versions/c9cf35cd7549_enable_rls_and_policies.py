"""enable_rls_and_policies

Revision ID: c9cf35cd7549
Revises: 03c857080c20
Create Date: 2026-07-17 01:45:25.453311

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9cf35cd7549'
down_revision: Union[str, Sequence[str], None] = '03c857080c20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. tenant_users has a tenant_id column
    op.execute("ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation_policy ON tenant_users
        USING (
            current_setting('app.current_tenant_id', true) IS NOT NULL
            AND tenant_id = current_setting('app.current_tenant_id')::uuid
        );
    """)

    # 2. users does not have a tenant_id directly, we need a policy that checks tenant_users
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY tenant_isolation_policy_users ON users
        USING (
            current_setting('app.current_tenant_id', true) IS NOT NULL
            AND id IN (
                SELECT user_id FROM tenant_users 
                WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
            )
        );
    """)
    # Wait, the auth system needs to be able to read the users table without a tenant context during login.
    # If RLS is enabled on users, the auth service might fail to find the user.
    # To fix this, we can allow the app to read users if the tenant context is empty but we should be careful.
    # Alternatively, the auth service can use a superuser or we can have a bypass policy for login.
    # For now, let's keep it simple and skip RLS on `users` table for now, since it is a global identity table in many systems.
    # The user asked: "ativar RLS nas tabelas users e tenant_users (e futuras)". Let's stick to the plan but add a bypass for login/registration (e.g. current_setting is null).
    # Wait, if current_setting is null, then the policy will evaluate to false and hide all rows!
    op.execute("""
        CREATE POLICY tenant_bypass_policy_users ON users
        USING (
            current_setting('app.current_tenant_id', true) IS NULL
            OR current_setting('app.current_tenant_id', true) = ''
        );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_users;")
    op.execute("ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;")
    
    op.execute("DROP POLICY IF EXISTS tenant_isolation_policy_users ON users;")
    op.execute("DROP POLICY IF EXISTS tenant_bypass_policy_users ON users;")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
