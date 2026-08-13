from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from modules.core.infrastructure.uow import UnitOfWork
from modules.pricing.domain.entities.price_table import PriceTable
from modules.pricing.domain.entities.pricing_rule import PricingRule
from modules.pricing.domain.services.price_calculation_engine import PriceCalculationEngine
from modules.pricing.domain.value_objects import (
    Money,
    PriceCalculationResult,
    PricingRuleScope,
    PricingRuleType,
)
from modules.pricing.infrastructure.repositories.pricing_repository import PricingRepository


class PricingService:
    def __init__(self, uow: UnitOfWork, repository: PricingRepository, calculation_engine: PriceCalculationEngine):
        self.uow = uow
        self.repository = repository
        self.calculation_engine = calculation_engine
        
    async def create_price_table(
        self,
        tenant_id: UUID,
        name: str,
        effective_date: date,
        end_date: date | None = None,
        region_id: UUID | None = None,
        customer_id: UUID | None = None,
        is_active: bool = False
    ) -> UUID:
        table = PriceTable(
            name=name,
            effective_date=effective_date,
            end_date=end_date,
            region_id=region_id,
            customer_id=customer_id,
            is_active=is_active
        )
        
        async with self.uow as uow:
            await self.repository.save_price_table(table, tenant_id)
            
            events = table.collect_events()
            # if events:
            #     self.outbox_repository.save(events)
            table.clear_events()
                
            await uow.commit()
            return table.id

    async def list_price_tables(self, tenant_id: UUID) -> list[PriceTable]:
        return await self.repository.list_price_tables(tenant_id)
        
    async def get_price_table(self, tenant_id: UUID, price_table_id: UUID) -> PriceTable | None:
        # In a real scenario we'd enforce tenant isolation if the domain object held the tenant_id, 
        # or do it at the repository level.
        return await self.repository.get_price_table_by_id(price_table_id)
            
    async def add_price_table_item(
        self,
        tenant_id: UUID,
        price_table_id: UUID,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        amount: Decimal,
        currency: str = "BRL"
    ) -> UUID:
        async with self.uow as uow:
            table = await self.repository.get_price_table_by_id(price_table_id)
            if not table:
                raise ValueError("Price table not found")
                
            unit_price = Money(amount=amount, currency=currency)
            item = table.add_item(service_offering_id, unit_of_measure_id, unit_price)
            
            await self.repository.save_price_table(table, tenant_id)
            
            events = table.collect_events()
            # if events:
            #     self.outbox_repository.save(events)
            table.clear_events()
            
            await uow.commit()
            return item.id
            
    async def create_pricing_rule(
        self,
        tenant_id: UUID,
        name: str,
        scope: PricingRuleScope,
        rule_type: PricingRuleType,
        value: Decimal,
        priority: int = 0,
        customer_id: UUID | None = None,
        service_offering_id: UUID | None = None,
        region_id: UUID | None = None
    ) -> UUID:
        rule = PricingRule(
            name=name,
            scope=scope,
            rule_type=rule_type,
            value=value,
            priority=priority,
            customer_id=customer_id,
            service_offering_id=service_offering_id,
            region_id=region_id
        )
        
        async with self.uow as uow:
            await self.repository.save_pricing_rule(rule, tenant_id)
            
            events = rule.collect_events()
            # if events:
            #     self.outbox_repository.save(events)
            rule.clear_events()
            
            await uow.commit()
            return rule.id

    async def calculate_price(
        self,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        quantity: Decimal,
        reference_date: date,
        region_id: UUID | None = None,
        customer_id: UUID | None = None
    ) -> PriceCalculationResult:
        """
        Calculates the final price based on the active tables and rules for a given context.
        """
        applicable_tables = await self.repository.get_applicable_price_tables(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            reference_date=reference_date,
            region_id=region_id,
            customer_id=customer_id
        )
        
        applicable_rules = await self.repository.get_applicable_pricing_rules(
            service_offering_id=service_offering_id,
            region_id=region_id,
            customer_id=customer_id
        )
            
        result = self.calculation_engine.calculate(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            quantity=quantity,
            applicable_tables=applicable_tables,
            applicable_rules=applicable_rules,
            customer_id=customer_id,
            region_id=region_id
        )
        
        # We emit an analytical event here if desired, but we do NOT save the snapshot
        # Quotation bounded context will be responsible for storing the snapshot.
        
        return result
