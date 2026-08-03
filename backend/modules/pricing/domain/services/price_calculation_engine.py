from decimal import Decimal
from uuid import UUID

from modules.pricing.domain.entities.price_table import PriceTable
from modules.pricing.domain.entities.pricing_rule import PricingRule
from modules.pricing.domain.value_objects import Money, PriceCalculationResult


class PriceCalculationEngine:
    """
    Stateless Domain Service for calculating the final price of a service offering.
    """
    
    def calculate(
        self,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        quantity: Decimal,
        applicable_tables: list[PriceTable],
        applicable_rules: list[PricingRule],
        customer_id: UUID | None = None,
        region_id: UUID | None = None
    ) -> PriceCalculationResult:
        if not applicable_tables:
            raise ValueError("No active price table found for this service and context.")
            
        # 1. Determine the Best Base Price
        # Precedence: CUSTOMER > REGION > GLOBAL
        best_table = self._select_best_table(applicable_tables, customer_id, region_id)
        
        # Find the specific item in the best table
        item = next(
            (i for i in best_table.items if i.service_offering_id == service_offering_id and i.unit_of_measure_id == unit_of_measure_id),
            None
        )
        if not item:
            raise ValueError(f"Selected PriceTable '{best_table.name}' does not contain an item for this service.")
            
        base_unit_price = item.unit_price
        total_base_price = Money(amount=base_unit_price.amount * quantity, currency=base_unit_price.currency)
        
        # 2. Apply Rules
        # Rules should already be sorted by priority in the repository, but let's ensure it.
        sorted_rules = sorted(applicable_rules, key=lambda r: r.priority, reverse=True)
        
        final_price = Money(amount=total_base_price.amount, currency=total_base_price.currency)
        applied_rules_ids = []
        
        for rule in sorted_rules:
            # Apply to total price
            final_price = rule.apply(final_price)
            applied_rules_ids.append(rule.id)
            
        return PriceCalculationResult(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            quantity=quantity,
            base_unit_price=base_unit_price,
            total_base_price=total_base_price,
            final_price=final_price,
            applied_rules_ids=applied_rules_ids
        )
        
    def _select_best_table(
        self, tables: list[PriceTable], customer_id: UUID | None, region_id: UUID | None
    ) -> PriceTable:
        # Check Customer specific first
        if customer_id:
            customer_tables = [t for t in tables if t.customer_id == customer_id]
            if customer_tables:
                return customer_tables[0] # Assuming DB invariants prevent overlapping dates for same customer
                
        # Check Region specific
        if region_id:
            region_tables = [t for t in tables if t.region_id == region_id]
            if region_tables:
                return region_tables[0]
                
        # Fallback to Global
        global_tables = [t for t in tables if not t.customer_id and not t.region_id]
        if global_tables:
            return global_tables[0]
            
        # If we reach here, no table matches the precedence strictly (which shouldn't happen based on repo logic)
        return tables[0]
