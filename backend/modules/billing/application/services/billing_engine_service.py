import uuid
from datetime import UTC, datetime, date
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from modules.billing.domain.entities.invoice import Invoice
from modules.billing.domain.repositories.invoice_repository import InvoiceRepository


class BillingEngineService:
    def __init__(
        self,
        session: AsyncSession,
        invoice_repository: InvoiceRepository,
    ):
        self.session = session
        self.invoice_repository = invoice_repository

    async def generate_monthly_invoices(self, tenant_id: uuid.UUID, reference_month: str) -> int:
        """
        Generates DRAFT invoices for all active customers in the given reference month.
        In this mock phase, it scans ServiceOrders for that month.
        `reference_month` format: "YYYY-MM"
        """
        from modules.logistics.infrastructure.orm_models import ORMServiceOrder
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        # 1. Fetch COMPLETED service orders for the given month
        year, month = map(int, reference_month.split("-"))
        start_date = date(year, month, 1)
        
        # Calculate next month for end date
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1
        end_date = date(next_year, next_month, 1)

        stmt = (
            select(ORMServiceOrder)
            .where(ORMServiceOrder.tenant_id == tenant_id)
            .where(ORMServiceOrder.status == "COMPLETED")
            .where(ORMServiceOrder.scheduled_date >= start_date)
            .where(ORMServiceOrder.scheduled_date < end_date)
            .options(selectinload(ORMServiceOrder.items))
        )
        
        result = await self.session.execute(stmt)
        completed_orders = result.scalars().all()
        
        if not completed_orders:
            return 0
            
        # 2. Group orders by Company
        orders_by_company = {}
        for order in completed_orders:
            if order.company_id not in orders_by_company:
                orders_by_company[order.company_id] = []
            orders_by_company[order.company_id].append(order)
            
        generated_count = 0
        
        # 3. Create an invoice for each Company
        for company_id, orders in orders_by_company.items():
            invoice = Invoice(
                company_id=company_id,
                tenant_id=tenant_id,
                reference_month=reference_month,
                status="DRAFT"
            )
            
            for order in orders:
                for item in order.items:
                    # For Phase 5 Mock: using a fixed unit price or pulling from order (if it had pricing)
                    # We assume 15.0 per kg/unit as a fallback if not integrated
                    unit_price = Decimal("15.00")
                    quantity = Decimal(str(item.quantity))
                    total = unit_price * quantity
                    
                    invoice.add_item(
                        service_offering_id=item.service_offering_id,
                        service_name=item.service_name,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total,
                        service_order_id=order.id
                    )
                    
            await self.invoice_repository.save(invoice)
            generated_count += 1
            
        await self.session.commit()
        return generated_count
