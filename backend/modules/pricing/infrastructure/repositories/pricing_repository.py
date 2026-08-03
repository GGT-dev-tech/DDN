from datetime import date
from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.pricing.domain.entities.price_table import PriceTable, PriceTableItem
from modules.pricing.domain.entities.pricing_rule import PricingRule
from modules.pricing.domain.value_objects import Money, PricingRuleScope, PricingRuleType
from modules.pricing.infrastructure.orm_models import (
    PricingPriceTableItemModel,
    PricingPriceTableModel,
    PricingRuleModel,
)


class PricingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    def _map_to_domain_price_table(self, model: PricingPriceTableModel) -> PriceTable:
        table = PriceTable(
            id=model.id,
            name=model.name,
            effective_date=model.effective_date,
            end_date=model.end_date,
            region_id=model.region_id,
            customer_id=model.customer_id,
            is_active=model.is_active
        )
        for item in model.items:
            table._items.append(PriceTableItem(
                id=item.id,
                service_offering_id=item.service_offering_id,
                unit_of_measure_id=item.unit_of_measure_id,
                unit_price=Money(amount=item.unit_price_amount, currency=item.unit_price_currency)
            ))
        table.clear_events()
        return table
        
    def _map_to_domain_pricing_rule(self, model: PricingRuleModel) -> PricingRule:
        rule = PricingRule(
            id=model.id,
            name=model.name,
            scope=PricingRuleScope(model.scope),
            rule_type=PricingRuleType(model.rule_type),
            value=model.value,
            priority=model.priority,
            customer_id=model.customer_id,
            service_offering_id=model.service_offering_id,
            region_id=model.region_id,
            is_active=model.is_active
        )
        rule.clear_events()
        return rule

    async def save_price_table(self, table: PriceTable, tenant_id: UUID) -> None:
        model = await self.session.get(PricingPriceTableModel, table.id)
        if not model:
            model = PricingPriceTableModel(
                id=table.id,
                tenant_id=tenant_id,
                name=table.name,
                effective_date=table.effective_date,
                end_date=table.end_date,
                region_id=table.region_id,
                customer_id=table.customer_id,
                is_active=table.is_active
            )
            self.session.add(model)
        else:
            model.name = table.name
            model.effective_date = table.effective_date
            model.end_date = table.end_date
            model.region_id = table.region_id
            model.customer_id = table.customer_id
            model.is_active = table.is_active
            
        # Handle items (simple replace approach for MVP)
        # Note: A real app might do smart diffing, here we just merge newly added ones
        existing_item_ids = {item.id for item in model.items} if getattr(model, 'items', None) else set()
        
        for item in table.items:
            if item.id not in existing_item_ids:
                item_model = PricingPriceTableItemModel(
                    id=item.id,
                    tenant_id=tenant_id,
                    price_table_id=table.id,
                    service_offering_id=item.service_offering_id,
                    unit_of_measure_id=item.unit_of_measure_id,
                    unit_price_amount=item.unit_price.amount,
                    unit_price_currency=item.unit_price.currency
                )
                self.session.add(item_model)
                
    async def save_pricing_rule(self, rule: PricingRule, tenant_id: UUID) -> None:
        model = await self.session.get(PricingRuleModel, rule.id)
        if not model:
            model = PricingRuleModel(
                id=rule.id,
                tenant_id=tenant_id,
                name=rule.name,
                scope=rule.scope.value,
                rule_type=rule.rule_type.value,
                value=rule.value,
                priority=rule.priority,
                customer_id=rule.customer_id,
                service_offering_id=rule.service_offering_id,
                region_id=rule.region_id,
                is_active=rule.is_active
            )
            self.session.add(model)
        else:
            model.name = rule.name
            model.scope = rule.scope.value
            model.rule_type = rule.rule_type.value
            model.value = rule.value
            model.priority = rule.priority
            model.customer_id = rule.customer_id
            model.service_offering_id = rule.service_offering_id
            model.region_id = rule.region_id
            model.is_active = rule.is_active

    async def get_price_table_by_id(self, id: UUID) -> PriceTable | None:
        stmt = select(PricingPriceTableModel).options(selectinload(PricingPriceTableModel.items)).where(PricingPriceTableModel.id == id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return self._map_to_domain_price_table(model)

    async def list_price_tables(self, tenant_id: UUID) -> list[PriceTable]:
        stmt = select(PricingPriceTableModel).options(selectinload(PricingPriceTableModel.items)).where(PricingPriceTableModel.tenant_id == tenant_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._map_to_domain_price_table(m) for m in models]


    async def get_applicable_price_tables(
        self,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        reference_date: date,
        region_id: UUID | None = None,
        customer_id: UUID | None = None
    ) -> list[PriceTable]:
        """Finds all active price tables covering the requested date, service, and context."""
        
        # We need tables that are active, and effective_date <= reference_date <= end_date (or end_date is null)
        date_filter = and_(
            PricingPriceTableModel.is_active == True,
            PricingPriceTableModel.effective_date <= reference_date,
            or_(
                PricingPriceTableModel.end_date == None,
                PricingPriceTableModel.end_date >= reference_date
            )
        )
        
        # Additionally, match scope (Customer-specific > Region-specific > Global)
        # We'll fetch all that match any of these scopes, engine will prioritize later.
        scope_conditions = []
        if customer_id:
            scope_conditions.append(PricingPriceTableModel.customer_id == customer_id)
        if region_id:
            scope_conditions.append(PricingPriceTableModel.region_id == region_id)
        # Global tables (no region, no customer)
        scope_conditions.append(
            and_(PricingPriceTableModel.customer_id == None, PricingPriceTableModel.region_id == None)
        )
        
        stmt = (
            select(PricingPriceTableModel)
            .options(selectinload(PricingPriceTableModel.items))
            .join(PricingPriceTableItemModel)
            .where(
                and_(
                    date_filter,
                    or_(*scope_conditions),
                    PricingPriceTableItemModel.service_offering_id == service_offering_id,
                    PricingPriceTableItemModel.unit_of_measure_id == unit_of_measure_id
                )
            )
        )
        
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._map_to_domain_price_table(m) for m in models]

    async def get_applicable_pricing_rules(
        self,
        service_offering_id: UUID,
        region_id: UUID | None = None,
        customer_id: UUID | None = None
    ) -> list[PricingRule]:
        """Finds all active rules matching the scope."""
        
        conditions = [
            PricingRuleModel.scope == PricingRuleScope.GLOBAL.value
        ]
        
        if customer_id:
            conditions.append(and_(
                PricingRuleModel.scope == PricingRuleScope.CUSTOMER.value,
                PricingRuleModel.customer_id == customer_id
            ))
            
        if region_id:
            conditions.append(and_(
                PricingRuleModel.scope == PricingRuleScope.REGION.value,
                PricingRuleModel.region_id == region_id
            ))
            
        conditions.append(and_(
            PricingRuleModel.scope == PricingRuleScope.SERVICE.value,
            PricingRuleModel.service_offering_id == service_offering_id
        ))
        
        stmt = select(PricingRuleModel).where(
            and_(
                PricingRuleModel.is_active == True,
                or_(*conditions)
            )
        ).order_by(PricingRuleModel.priority.desc())
        
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._map_to_domain_pricing_rule(m) for m in models]
