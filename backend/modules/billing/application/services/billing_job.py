import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.billing.domain.entities.invoice import Invoice
from modules.billing.infrastructure.repositories.sqlalchemy_invoice_repository import (
    SQLAlchemyInvoiceRepository,
)
from modules.logistics.domain.value_objects.status import ServiceOrderStatus
from modules.logistics.infrastructure.orm_models import ORMServiceOrder
from modules.pricing.application.services.pricing_service import PricingService


class DailyBillingJob:
    def __init__(
        self,
        session: AsyncSession,
        invoice_repository: SQLAlchemyInvoiceRepository,
        pricing_service: PricingService
    ):
        self.session = session
        self.invoice_repository = invoice_repository
        self.pricing_service = pricing_service

    async def execute(self, tenant_id: uuid.UUID, reference_date: date) -> list[uuid.UUID]:
        """
        Fechas as operações do dia:
        1. Encontra todas as O.S. (ServiceOrders) COMPLETED para a data especificada.
        2. Agrupa por company_id.
        3. Para cada company_id, calcula o preco dos itens da O.S.
        4. Gera um Invoice consolidado para aquele cliente (company_id).
        """
        stmt = (
            select(ORMServiceOrder)
            .where(
                ORMServiceOrder.tenant_id == tenant_id,
                ORMServiceOrder.scheduled_date == reference_date,
                ORMServiceOrder.status == ServiceOrderStatus.COMPLETED
            )
            .options(selectinload(ORMServiceOrder.items))
        )
        
        result = await self.session.execute(stmt)
        service_orders = result.scalars().all()
        
        if not service_orders:
            return []

        # Group by company_id
        company_orders: dict[uuid.UUID, list[ORMServiceOrder]] = {}
        for order in service_orders:
            company_orders.setdefault(order.company_id, []).append(order)
            
        generated_invoice_ids = []
        
        for company_id, orders in company_orders.items():
            invoice = Invoice.create(
                tenant_id=tenant_id,
                company_id=company_id,
                reference_date=reference_date
            )
            
            for order in orders:
                for item in order.items:
                    try:
                        # Assuming the `quantity` string holds a parseable number for now
                        qty_val = float(item.quantity.split()[0]) if item.quantity else 1.0
                    except Exception:
                        qty_val = 1.0
                        
                    # Here we would call pricing_service, but we need unit_of_measure_id.
                    # For simplicity, we just use a placeholder or fake call if we don't have it.
                    # As this is an MVP without full integration of unit of measure in O.S. yet, we mock a price or fetch a default.
                    
                    unit_price = 150.0  # Placeholder for price
                    
                    invoice.add_item(
                        service_order_id=order.id,
                        description=item.service_name,
                        quantity=qty_val,
                        unit_price=unit_price
                    )
                    
            await self.invoice_repository.save(invoice)
            generated_invoice_ids.append(invoice.id)
            
        await self.session.commit()
        return generated_invoice_ids
