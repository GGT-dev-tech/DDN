import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from uuid6 import uuid7

from apps.api_gateway.src.main import app
from database.session import get_db_session
from modules.core.config.settings import settings
from modules.identity.dependencies import require_tenant

pytestmark = pytest.mark.asyncio

@pytest.fixture
async def pg_engine():
    # Use real PostgreSQL from environment
    url = settings.db.url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(url)
    
    # Clean up table before tests
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE commercial_leads CASCADE"))
        
    yield engine
    await engine.dispose()

@pytest.fixture
async def pg_session(pg_engine):
    async_session = async_sessionmaker(
        pg_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

@pytest.fixture
async def async_api_client(pg_session):
    async def override_get_db():
        yield pg_session
        
    tenant_id = uuid7()
    
    async def override_require_tenant():
        return tenant_id

    app.dependency_overrides[get_db_session] = override_get_db
    app.dependency_overrides[require_tenant] = override_require_tenant
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, tenant_id
    
    app.dependency_overrides.clear()

async def test_register_lead(async_api_client):
    client, tenant_id = async_api_client
    
    response = await client.post(
        "/api/v1/commercial/leads",
        json={
            "company_name": "API Test Corp",
            "contact_name": "API John",
            "email": "api@testcorp.com",
            "phone": "555-9999"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["company_name"] == "API Test Corp"
    assert data["status"] == "NEW"

async def test_qualify_lead(async_api_client):
    client, tenant_id = async_api_client
    
    # Register first
    response = await client.post(
        "/api/v1/commercial/leads",
        json={
            "company_name": "API Qualify Corp",
            "contact_name": "Jane",
            "email": "jane@qualify.com",
            "phone": "1234567890"
        }
    )
    assert response.status_code == 200
    lead_id = response.json()["id"]
    
    # Qualify
    qualify_response = await client.post(f"/api/v1/commercial/leads/{lead_id}/qualify")
    print("Error output:", qualify_response.json())
    assert qualify_response.status_code == 200
    
    data = qualify_response.json()
    assert data["status"] == "QUALIFIED"
