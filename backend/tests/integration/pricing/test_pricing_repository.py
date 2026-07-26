import pytest
from uuid import uuid4
from decimal import Decimal
from datetime import date

from modules.pricing.domain.entities.price_table import PriceTable
from modules.pricing.domain.entities.pricing_rule import PricingRule
from modules.pricing.domain.value_objects import Money, PricingRuleScope, PricingRuleType
from modules.pricing.infrastructure.repositories.pricing_repository import PricingRepository

pytestmark = pytest.mark.asyncio

async def test_pricing_repository_save_and_retrieve_table(db_session):
    repo = PricingRepository(db_session)
    tenant_id = uuid4()
    
    table = PriceTable(name="Integration Table", effective_date=date(2026, 1, 1), is_active=True)
    service_id = uuid4()
    uom_id = uuid4()
    table.add_item(service_id, uom_id, Money(Decimal("150.00")))
    
    await repo.save_price_table(table, tenant_id)
    await db_session.commit()
    
    loaded = await repo.get_price_table_by_id(table.id)
    assert loaded is not None
    assert loaded.name == "Integration Table"
    assert len(loaded.items) == 1
    assert loaded.items[0].unit_price.amount == Decimal("150.00")
    
async def test_get_applicable_price_tables(db_session):
    repo = PricingRepository(db_session)
    tenant_id = uuid4()
    
    service_id = uuid4()
    uom_id = uuid4()
    
    table = PriceTable(name="Active Global", effective_date=date(2025, 1, 1), is_active=True)
    table.add_item(service_id, uom_id, Money(Decimal("100.00")))
    
    await repo.save_price_table(table, tenant_id)
    await db_session.commit()
    
    tables = await repo.get_applicable_price_tables(
        service_offering_id=service_id,
        unit_of_measure_id=uom_id,
        reference_date=date(2026, 1, 1)
    )
    
    assert len(tables) == 1
    assert tables[0].id == table.id

async def test_save_and_retrieve_rule(db_session):
    repo = PricingRepository(db_session)
    tenant_id = uuid4()
    
    rule = PricingRule(
        name="Global 10%",
        scope=PricingRuleScope.GLOBAL,
        rule_type=PricingRuleType.PERCENTAGE_DISCOUNT,
        value=Decimal("10.00"),
        priority=1
    )
    
    await repo.save_pricing_rule(rule, tenant_id)
    await db_session.commit()
    
    rules = await repo.get_applicable_pricing_rules(service_offering_id=uuid4())
    assert len(rules) == 1
    assert rules[0].name == "Global 10%"
