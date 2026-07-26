
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from uuid6 import uuid7

from modules.core.config.settings import settings

pytestmark = pytest.mark.asyncio

async def test_rls_prevents_cross_tenant_access():
    """
    Ensures that the application user (stitch_app) cannot bypass RLS by querying without 
    a tenant context, or cannot see data from another tenant.
    """
    engine = create_async_engine(settings.db.url.replace("postgresql://", "postgresql+asyncpg://"))
    
    tenant_1_id = uuid7()
    tenant_2_id = uuid7()
    
    # 1. As migration user (admin), insert test tenants and some tenant_users
    # Assuming tests are run with superuser or stitch_migration for setup
    async with engine.begin() as conn:
        await conn.execute(text("INSERT INTO tenants (id, name, document_number, plan, status, created_at, updated_at) VALUES (:id, 'Tenant 1', :doc, 'FREE', 'ACTIVE', now(), now())"), {"id": tenant_1_id, "doc": f"doc1_{uuid7()}"})
        await conn.execute(text("INSERT INTO tenants (id, name, document_number, plan, status, created_at, updated_at) VALUES (:id, 'Tenant 2', :doc, 'FREE', 'ACTIVE', now(), now())"), {"id": tenant_2_id, "doc": f"doc2_{uuid7()}"})
        
        user_id = uuid7()
        await conn.execute(text("INSERT INTO users (id, email, password_hash, status, created_at, updated_at) VALUES (:id, :email, 'hash', 'ACTIVE', now(), now())"), {"id": user_id, "email": f"testrls_{uuid7()}@stitch.com"})
        
        # Insert a user in tenant 1
        await conn.execute(text("INSERT INTO tenant_users (id, tenant_id, user_id, role, created_at) VALUES (:id, :tenant, :user, 'OWNER', now())"), {"id": uuid7(), "tenant": tenant_1_id, "user": user_id})

    # 2. Reconnect as stitch_app (App user)
    app_engine = create_async_engine(
        settings.db.url.replace("postgresql://", "postgresql+asyncpg://")
        .replace("stitch_admin:secret_postgres", "stitch_app:app_secret")
        .replace("stitch_user", "stitch_app")
    )
    
    # Try querying tenant_users without setting context
    async with app_engine.connect() as conn:
        try:
            # We assume RLS is FORCE enabled, so without SET LOCAL app.current_tenant_id it should return 0 rows 
            # (or throw an error if we made it very strict)
            result = await conn.execute(text("SELECT count(*) FROM tenant_users WHERE tenant_id = :tenant"), {"tenant": tenant_1_id})
            count = result.scalar()
            
            # Since RLS policy is: tenant_id = current_setting('app.current_tenant_id')::uuid
            # It will either evaluate to false or raise an exception (missing setting)
            assert count == 0
        except Exception as e:
            # If current_setting missing throws error, that's also valid RLS enforcement
            assert "unrecognized configuration parameter" in str(e) or "current_setting" in str(e)

    # Set context to Tenant 2, try to read Tenant 1's data
    async with app_engine.begin() as conn:
        await conn.execute(text(f"SET LOCAL app.current_tenant_id = '{tenant_2_id}'"))
        result = await conn.execute(text("SELECT count(*) FROM tenant_users WHERE tenant_id = :tenant"), {"tenant": tenant_1_id})
        count = result.scalar()
        assert count == 0 # Cannot see Tenant 1 data

    # Set context to Tenant 1, try to read Tenant 1's data
    async with app_engine.begin() as conn:
        await conn.execute(text(f"SET LOCAL app.current_tenant_id = '{tenant_1_id}'"))
        result = await conn.execute(text("SELECT count(*) FROM tenant_users WHERE tenant_id = :tenant"), {"tenant": tenant_1_id})
        count = result.scalar()
        assert count == 1 # Can see Tenant 1 data
        
    await engine.dispose()
    await app_engine.dispose()
