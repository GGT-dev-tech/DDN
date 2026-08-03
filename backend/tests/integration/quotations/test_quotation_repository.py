from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
from sqlalchemy import text

from modules.quotations.domain.entities.quotation import Quotation, QuotationStatus
from modules.quotations.domain.value_objects import Money, QuotationItemSnapshot
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository

pytestmark = pytest.mark.asyncio

async def test_quotation_repository_save_and_reconstitute_aggregate(db_session):
    repo = QuotationRepository(db_session)
    tenant_id = uuid4()
    company_id = uuid4()
    
    expires_at = datetime.now(UTC) + timedelta(days=30)
    quotation = Quotation.create_draft(company_id=company_id, tenant_id=tenant_id, expires_at=expires_at)
    
    service_offering_id = uuid4()
    unit_of_measure_id = uuid4()
    item = quotation.add_item(service_offering_id, unit_of_measure_id, Decimal("10.0"))
    
    snapshot = QuotationItemSnapshot(
        service_name="Test Service",
        unit_name="TON",
        base_unit_price=Money(Decimal("150.00"), "BRL"),
        total_base_price=Money(Decimal("1500.00"), "BRL"),
        surcharges_total=Money(Decimal("0.00"), "BRL"),
        discounts_total=Money(Decimal("0.00"), "BRL"),
        final_price=Money(Decimal("1500.00"), "BRL"),
        pricing_reference="Table 1"
    )
    
    item.attach_snapshot(snapshot)
    quotation.mark_as_priced()
    
    await repo.save_quotation(quotation)
    await db_session.commit()
    
    # Reconstitute
    loaded = await repo.get_quotation_by_id(quotation.id)
    assert loaded is not None
    assert loaded.status == QuotationStatus.PRICED
    assert loaded.company_id == company_id
    assert len(loaded.items) == 1
    
    loaded_item = loaded.items[0]
    assert loaded_item.service_offering_id == service_offering_id
    assert loaded_item.quantity == Decimal("10.0")
    
    assert loaded_item.snapshot is not None
    assert loaded_item.snapshot.final_price.amount == Decimal("1500.00")
    assert loaded_item.snapshot.service_name == "Test Service"

async def test_quotation_repository_tenant_isolation(db_session):
    if db_session.bind.dialect.name == "sqlite":
        pytest.skip("RLS tenant isolation requires PostgreSQL")
        
    repo = QuotationRepository(db_session)
    tenant_a = uuid4()
    tenant_b = uuid4()
    company_id = uuid4()
    
    # 1. Save as Tenant A
    await db_session.execute(text(f"SET LOCAL rls.tenant_id = '{tenant_a}'"))
    expires_at = datetime.now(UTC) + timedelta(days=30)
    quotation_a = Quotation.create_draft(company_id=company_id, tenant_id=tenant_a, expires_at=expires_at)
    await repo.save_quotation(quotation_a)
    await db_session.commit()
    
    # 2. Try to read as Tenant B
    await db_session.execute(text(f"SET LOCAL rls.tenant_id = '{tenant_b}'"))
    loaded_b = await repo.get_quotation_by_id(quotation_a.id)
    
    # 3. Assert isolation
    assert loaded_b is None
