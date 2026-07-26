import pytest
from decimal import Decimal
from datetime import date
from uuid import uuid4

from modules.pricing.domain.services.price_calculation_engine import PriceCalculationEngine
from modules.pricing.domain.entities.price_table import PriceTable
from modules.pricing.domain.entities.pricing_rule import PricingRule
from modules.pricing.domain.value_objects import Money, PricingRuleScope, PricingRuleType

def test_engine_calculates_price_correctly():
    engine = PriceCalculationEngine()
    service_offering_id = uuid4()
    uom_id = uuid4()
    customer_id = uuid4()
    
    # Setup global table
    global_table = PriceTable(name="Global 2026", effective_date=date(2026, 1, 1))
    global_table.add_item(service_offering_id, uom_id, Money(Decimal("100.00")))
    
    # Setup rule (10% discount)
    discount_rule = PricingRule(
        name="VIP Discount",
        scope=PricingRuleScope.GLOBAL,
        rule_type=PricingRuleType.PERCENTAGE_DISCOUNT,
        value=Decimal("10.00"),
        priority=1
    )
    
    # Setup rule (Fixed Surcharge of $5)
    surcharge_rule = PricingRule(
        name="Processing Fee",
        scope=PricingRuleScope.GLOBAL,
        rule_type=PricingRuleType.ABSOLUTE_SURCHARGE,
        value=Decimal("5.00"),
        priority=2
    )

    result = engine.calculate(
        service_offering_id=service_offering_id,
        unit_of_measure_id=uom_id,
        quantity=Decimal("2"), # 2 units * $100 = $200 total base
        applicable_tables=[global_table],
        applicable_rules=[discount_rule, surcharge_rule], # Will sort by priority: Surcharge (2) then Discount (1)
        customer_id=customer_id
    )
    
    # Base: 200
    # Surcharge first: 200 + 5 = 205
    # Discount second: 205 - 10% = 184.50
    assert result.total_base_price.amount == Decimal("200.00")
    assert result.final_price.amount == Decimal("184.50")
    assert result.final_price.currency == "BRL"
    
def test_engine_table_precedence():
    engine = PriceCalculationEngine()
    service_offering_id = uuid4()
    uom_id = uuid4()
    customer_id = uuid4()
    
    global_table = PriceTable(name="Global 2026", effective_date=date(2026, 1, 1))
    global_table.add_item(service_offering_id, uom_id, Money(Decimal("100.00")))
    
    customer_table = PriceTable(name="Customer 2026", effective_date=date(2026, 1, 1), customer_id=customer_id)
    customer_table.add_item(service_offering_id, uom_id, Money(Decimal("80.00")))

    result = engine.calculate(
        service_offering_id=service_offering_id,
        unit_of_measure_id=uom_id,
        quantity=Decimal("1"),
        applicable_tables=[global_table, customer_table],
        applicable_rules=[],
        customer_id=customer_id
    )
    
    # Should pick customer_table
    assert result.base_unit_price.amount == Decimal("80.00")
