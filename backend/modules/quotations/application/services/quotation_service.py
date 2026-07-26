from datetime import date, datetime, timedelta, UTC
from decimal import Decimal
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from modules.quotations.domain.entities.quotation import Quotation
from modules.quotations.domain.value_objects import QuotationStatus
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository
from modules.quotations.application.ports.pricing_gateway import PricingGateway, PricingContext
from modules.quotations.application.ports.catalog_gateway import CatalogGateway


class QuotationService:
    def __init__(
        self,
        session: AsyncSession,
        repository: QuotationRepository,
        pricing_gateway: PricingGateway,
        catalog_gateway: CatalogGateway
    ):
        self.session = session
        self.repository = repository
        self.pricing_gateway = pricing_gateway
        self.catalog_gateway = catalog_gateway

    async def create_quotation(
        self,
        tenant_id: UUID,
        company_id: UUID,
        validity_days: int = 30
    ) -> UUID:
        expires_at = datetime.now(UTC) + timedelta(days=validity_days)
        quotation = Quotation.create_draft(
            company_id=company_id,
            tenant_id=tenant_id,
            expires_at=expires_at
        )
        
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()
        return quotation.id

    async def add_item(
        self,
        quotation_id: UUID,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        quantity: Decimal
    ) -> UUID:
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        item = quotation.add_item(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            quantity=quantity
        )
        
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()
        
        return item.id

    async def calculate(self, quotation_id: UUID, reference_date: date) -> None:
        """
        Orchestrates the calculation logic for a quotation, generating snapshots for every item
        based on active catalog and pricing at the `reference_date`.
        """
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        if quotation.status != QuotationStatus.DRAFT:
            raise ValueError(f"Can only calculate DRAFT quotations, current is {quotation.status.value}")

        for item in quotation.items:
            # 1. Fetch metadata from Catalog via Gateway
            service_name = await self.catalog_gateway.get_service_offering_name(item.service_offering_id)
            unit_name = await self.catalog_gateway.get_unit_of_measure_name(item.unit_of_measure_id)
            
            # 2. Build Pricing Context
            context = PricingContext(
                service_offering_id=item.service_offering_id,
                unit_of_measure_id=item.unit_of_measure_id,
                quantity=item.quantity,
                reference_date=reference_date,
                customer_id=quotation.company_id,
                service_name=service_name,
                unit_name=unit_name
            )
            
            # 3. Call Pricing Engine and Get Snapshot
            snapshot = await self.pricing_gateway.get_price_snapshot(context)
            item.attach_snapshot(snapshot)
            
        # 4. Mark as PRICED and Save
        quotation.mark_as_priced()
        
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()

    async def submit(self, quotation_id: UUID) -> None:
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        quotation.submit()
        
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()

    async def approve(self, quotation_id: UUID) -> None:
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        quotation.approve()
        
        await self.repository.save_quotation(quotation)
        
        events = quotation.collect_events()
        # TODO: Persist events to outbox for Commercial Contract module
        
        quotation.clear_events()
        await self.session.commit()

    async def reject(self, quotation_id: UUID) -> None:
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        quotation.reject()
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()

    async def expire(self, quotation_id: UUID) -> None:
        quotation = await self.repository.get_quotation_by_id(quotation_id)
        if not quotation:
            raise ValueError("Quotation not found")
            
        quotation.expire()
        await self.repository.save_quotation(quotation)
        quotation.clear_events()
        await self.session.commit()
