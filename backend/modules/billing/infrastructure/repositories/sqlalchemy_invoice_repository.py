import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.billing.domain.entities.invoice import Invoice, InvoiceItem, InvoiceStatus
from modules.billing.infrastructure.orm_models import ORMInvoice, ORMInvoiceItem


class SQLAlchemyInvoiceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, invoice_id: uuid.UUID) -> Invoice | None:
        stmt = (
            select(ORMInvoice)
            .where(ORMInvoice.id == invoice_id)
            .options(selectinload(ORMInvoice.items))
        )
        result = await self.session.execute(stmt)
        orm_invoice = result.scalar_one_or_none()
        
        if not orm_invoice:
            return None
            
        return self._to_domain(orm_invoice)

    async def list_by_tenant(self, tenant_id: uuid.UUID) -> Sequence[Invoice]:
        stmt = (
            select(ORMInvoice)
            .where(ORMInvoice.tenant_id == tenant_id)
            .options(selectinload(ORMInvoice.items))
        )
        result = await self.session.execute(stmt)
        return [self._to_domain(orm) for orm in result.scalars().all()]

    async def save(self, invoice: Invoice) -> None:
        # Check if exists
        stmt = select(ORMInvoice).where(ORMInvoice.id == invoice.id).options(selectinload(ORMInvoice.items))
        result = await self.session.execute(stmt)
        orm_invoice = result.scalar_one_or_none()
        
        if not orm_invoice:
            orm_invoice = ORMInvoice(
                id=invoice.id,
                tenant_id=invoice.tenant_id,
                company_id=invoice.company_id,
                reference_date=invoice.reference_date,
                status=invoice.status,
                total_amount=invoice.total_amount,
                due_date=invoice.due_date,
                created_at=invoice.created_at,
                updated_at=invoice.updated_at
            )
            self.session.add(orm_invoice)
        else:
            orm_invoice.status = invoice.status
            orm_invoice.total_amount = invoice.total_amount
            orm_invoice.due_date = invoice.due_date
            orm_invoice.updated_at = invoice.updated_at
            
            # Sync items
            existing_item_ids = {item.id for item in orm_invoice.items}
            domain_item_ids = {item.id for item in invoice.items}
            
            # Remove deleted
            items_to_remove = [item for item in orm_invoice.items if item.id not in domain_item_ids]
            for item in items_to_remove:
                orm_invoice.items.remove(item)
                
            # Add or update
            for domain_item in invoice.items:
                if domain_item.id not in existing_item_ids:
                    orm_invoice.items.append(
                        ORMInvoiceItem(
                            id=domain_item.id,
                            invoice_id=invoice.id,
                            service_order_id=domain_item.service_order_id,
                            description=domain_item.description,
                            quantity=domain_item.quantity,
                            unit_price=domain_item.unit_price,
                            total_price=domain_item.total_price
                        )
                    )

    def _to_domain(self, orm: ORMInvoice) -> Invoice:
        invoice = Invoice(
            id=orm.id,
            tenant_id=orm.tenant_id,
            company_id=orm.company_id,
            reference_date=orm.reference_date,
            status=orm.status,
            total_amount=orm.total_amount,
            due_date=orm.due_date,
            created_at=orm.created_at,
            updated_at=orm.updated_at
        )
        for item_orm in orm.items:
            invoice.items.append(
                InvoiceItem(
                    id=item_orm.id,
                    service_order_id=item_orm.service_order_id,
                    description=item_orm.description,
                    quantity=item_orm.quantity,
                    unit_price=item_orm.unit_price,
                    total_price=item_orm.total_price
                )
            )
        return invoice
