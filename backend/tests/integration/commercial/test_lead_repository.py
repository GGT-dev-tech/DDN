import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from uuid6 import uuid7

from modules.commercial.domain.entities.lead import Lead, LeadStatus
from modules.commercial.infrastructure.repositories.lead_repository import LeadRepository
from modules.core.config.settings import settings

pytestmark = pytest.mark.asyncio

@pytest.fixture
async def pg_engine():
    # Use real PostgreSQL from environment
    url = settings.db.url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(url)
    
    # Clean up table before tests
    async with engine.begin() as conn:
        # Disable RLS temporarily to clean up across all tenants if needed, or just truncate
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

async def test_lead_repository_add_and_get(pg_session):
    repo = LeadRepository(pg_session)
    
    tenant_id = uuid7()
    lead = Lead(
        id=uuid7(),
        tenant_id=tenant_id,
        company_name="Test Corp",
        contact_name="John Doe",
        status=LeadStatus.NEW,
        email="john@testcorp.com",
        phone="555-1234"
    )
    
    await repo.add(lead)
    await pg_session.commit()
    
    # Read back
    fetched_lead = await repo.get_by_id(tenant_id, lead.id)
    
    assert fetched_lead is not None
    assert fetched_lead.id == lead.id
    assert fetched_lead.company_name == "Test Corp"
    assert fetched_lead.status == LeadStatus.NEW

async def test_lead_repository_update(pg_session):
    repo = LeadRepository(pg_session)
    
    tenant_id = uuid7()
    lead = Lead(
        id=uuid7(),
        tenant_id=tenant_id,
        company_name="Update Corp",
        contact_name="Jane Doe",
        status=LeadStatus.NEW
    )
    
    await repo.add(lead)
    await pg_session.commit()
    
    lead.status = LeadStatus.QUALIFIED
    lead.company_name = "Updated Corp Inc"
    
    await repo.update(lead)
    await pg_session.commit()
    
    fetched_lead = await repo.get_by_id(tenant_id, lead.id)
    
    assert fetched_lead is not None
    assert fetched_lead.status == LeadStatus.QUALIFIED
    assert fetched_lead.company_name == "Updated Corp Inc"
