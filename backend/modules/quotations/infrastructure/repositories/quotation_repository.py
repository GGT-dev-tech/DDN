import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.quotations.domain.entities.quotation import Quotation, QuotationItem
from modules.quotations.domain.value_objects import Money, QuotationItemSnapshot
from modules.quotations.infrastructure.orm_models import (
    QuotationItemModel,
    QuotationItemSnapshotModel,
    QuotationModel,
)


class QuotationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_quotation_by_id(self, quotation_id: uuid.UUID) -> Quotation | None:
        stmt = (
            select(QuotationModel)
            .options(
                selectinload(QuotationModel.items)
                .selectinload(QuotationItemModel.snapshot)
            )
            .where(QuotationModel.id == quotation_id)
        )
        
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            return None
            
        quotation = Quotation(
            company_id=model.company_id,
            tenant_id=model.tenant_id,
            id=model.id,
            price_table_id=model.price_table_id,
            status=model.status,
            expires_at=model.expires_at,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
        
        for item_model in model.items:
            snapshot = None
            if item_model.snapshot:
                snapshot = QuotationItemSnapshot(
                    service_name=item_model.snapshot.service_name,
                    unit_name=item_model.snapshot.unit_name,
                    base_unit_price=Money(item_model.snapshot.base_unit_price, item_model.snapshot.currency),
                    total_base_price=Money(item_model.snapshot.total_base_price, item_model.snapshot.currency),
                    surcharges_total=Money(item_model.snapshot.surcharges_total, item_model.snapshot.currency),
                    discounts_total=Money(item_model.snapshot.discounts_total, item_model.snapshot.currency),
                    final_price=Money(item_model.snapshot.final_price, item_model.snapshot.currency),
                    pricing_reference=item_model.snapshot.pricing_reference
                )
                
            item = QuotationItem(
                id=item_model.id,
                service_offering_id=item_model.service_offering_id,
                unit_of_measure_id=item_model.unit_of_measure_id,
                quantity=item_model.quantity,
                snapshot=snapshot
            )
            quotation.items.append(item)
            
        return quotation

    async def save_quotation(self, quotation: Quotation) -> None:
        model = await self.session.get(QuotationModel, quotation.id)
        
        if not model:
            model = QuotationModel(
                id=quotation.id,
                tenant_id=quotation.tenant_id,
                company_id=quotation.company_id,
                price_table_id=quotation.price_table_id,
                status=quotation.status,
                expires_at=quotation.expires_at,
                created_at=quotation.created_at,
                updated_at=quotation.updated_at
            )
            self.session.add(model)
        else:
            model.price_table_id = quotation.price_table_id
            model.status = quotation.status
            model.expires_at = quotation.expires_at
            model.updated_at = quotation.updated_at
            
        # Handle Items
        # A simple merge approach for items:
        existing_items = {item.id: item for item in await self._get_existing_items(quotation.id)}
        
        for item in quotation.items:
            if item.id in existing_items:
                item_model = existing_items[item.id]
                item_model.service_offering_id = item.service_offering_id
                item_model.unit_of_measure_id = item.unit_of_measure_id
                item_model.quantity = item.quantity
            else:
                item_model = QuotationItemModel(
                    id=item.id,
                    tenant_id=quotation.tenant_id,
                    quotation_id=quotation.id,
                    service_offering_id=item.service_offering_id,
                    unit_of_measure_id=item.unit_of_measure_id,
                    quantity=item.quantity
                )
                self.session.add(item_model)
                
            # Handle Snapshot
            if item.snapshot:
                # Get existing snapshot model if any
                snapshot_model = await self.session.get(QuotationItemSnapshotModel, item.id)
                if not snapshot_model:
                    snapshot_model = QuotationItemSnapshotModel(
                        id=item.id,
                        tenant_id=quotation.tenant_id,
                        quotation_item_id=item.id,
                        service_name=item.snapshot.service_name,
                        unit_name=item.snapshot.unit_name,
                        base_unit_price=item.snapshot.base_unit_price.amount,
                        total_base_price=item.snapshot.total_base_price.amount,
                        surcharges_total=item.snapshot.surcharges_total.amount,
                        discounts_total=item.snapshot.discounts_total.amount,
                        final_price=item.snapshot.final_price.amount,
                        currency=item.snapshot.final_price.currency,
                        pricing_reference=item.snapshot.pricing_reference,
                        created_at=datetime.now(UTC)
                    )
                    self.session.add(snapshot_model)

    async def _get_existing_items(self, quotation_id: uuid.UUID) -> list[QuotationItemModel]:
        stmt = select(QuotationItemModel).where(QuotationItemModel.quotation_id == quotation_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_quotations(self, tenant_id: uuid.UUID) -> list[Quotation]:
        stmt = (
            select(QuotationModel)
            .options(
                selectinload(QuotationModel.items)
                .selectinload(QuotationItemModel.snapshot)
            )
            .where(QuotationModel.tenant_id == tenant_id)
            .order_by(QuotationModel.created_at.desc())
        )
        
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        quotations = []
        for model in models:
            quotation = Quotation(
                company_id=model.company_id,
                tenant_id=model.tenant_id,
                id=model.id,
                price_table_id=model.price_table_id,
                status=model.status,
                expires_at=model.expires_at,
                created_at=model.created_at,
                updated_at=model.updated_at
            )
            
            for item_model in model.items:
                snapshot = None
                if item_model.snapshot:
                    snapshot = QuotationItemSnapshot(
                        service_name=item_model.snapshot.service_name,
                        unit_name=item_model.snapshot.unit_name,
                        base_unit_price=Money(item_model.snapshot.base_unit_price, item_model.snapshot.currency),
                        total_base_price=Money(item_model.snapshot.total_base_price, item_model.snapshot.currency),
                        surcharges_total=Money(item_model.snapshot.surcharges_total, item_model.snapshot.currency),
                        discounts_total=Money(item_model.snapshot.discounts_total, item_model.snapshot.currency),
                        final_price=Money(item_model.snapshot.final_price, item_model.snapshot.currency),
                        pricing_reference=item_model.snapshot.pricing_reference
                    )
                    
                item = QuotationItem(
                    id=item_model.id,
                    service_offering_id=item_model.service_offering_id,
                    unit_of_measure_id=item_model.unit_of_measure_id,
                    quantity=item_model.quantity,
                    snapshot=snapshot
                )
                quotation.items.append(item)
                
            quotations.append(quotation)
            
        return quotations
