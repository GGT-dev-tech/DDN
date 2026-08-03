import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.billing.domain.entities.invoice import Invoice, InvoiceItem
from modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from modules.billing.infrastructure.orm_models import ORMInvoice, ORMInvoiceItem


class SQLInvoiceRepository(InvoiceRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, orm: ORMInvoice) -> Invoice:
        invoice = Invoice(
            id=orm.id,
            company_id=orm.company_id,
            tenant_id=orm.tenant_id,
            reference_month=orm.reference_month,
            status=orm.status,
            issue_date=orm.issue_date,
            due_date=orm.due_date,
            created_at=orm.created_at,
            updated_at=orm.updated_at
        )
        for orm_item in orm.items:
            invoice.add_item(
                service_offering_id=orm_item.service_offering_id,
                service_name=orm_item.service_name,
                quantity=Decimal(str(orm_item.quantity)),
                unit_price=Decimal(str(orm_item.unit_price)),
                total_price=Decimal(str(orm_item.total_price)),
                service_order_id=orm_item.service_order_id
            )
            # Override item ID to match DB
            invoice.items[-1].id = orm_item.id
        return invoice

    def _to_orm(self, invoice: Invoice) -> ORMInvoice:
        orm = ORMInvoice(
            id=invoice.id,
            tenant_id=invoice.tenant_id,
            company_id=invoice.company_id,
            reference_month=invoice.reference_month,
            status=invoice.status,
            issue_date=invoice.issue_date,
            due_date=invoice.due_date,
            created_at=invoice.created_at,
            updated_at=invoice.updated_at
        )
        for item in invoice.items:
            orm_item = ORMInvoiceItem(
                id=item.id,
                invoice_id=invoice.id,
                service_offering_id=item.service_offering_id,
                service_name=item.service_name,
                quantity=float(item.quantity),
                unit_price=float(item.unit_price),
                total_price=float(item.total_price),
                service_order_id=item.service_order_id
            )
            orm.items.append(orm_item)
        return orm

    async def get_by_id(self, invoice_id: uuid.UUID) -> Invoice | None:
        stmt = (
            select(ORMInvoice)
            .where(ORMInvoice.id == invoice_id)
            .options(selectinload(ORMInvoice.items))
        )
        result = await self.session.execute(stmt)
        orm = result.scalar_one_or_none()
        if not orm:
            return None
        return self._to_domain(orm)

    async def get_by_tenant(self, tenant_id: uuid.UUID) -> list[Invoice]:
        stmt = (
            select(ORMInvoice)
            .where(ORMInvoice.tenant_id == tenant_id)
            .options(selectinload(ORMInvoice.items))
            .order_by(ORMInvoice.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return [self._to_domain(orm) for orm in result.scalars().all()]

    async def save(self, invoice: Invoice) -> None:
        orm = await self.session.get(ORMInvoice, invoice.id)
        if not orm:
            orm = self._to_orm(invoice)
            self.session.add(orm)
        else:
            orm.status = invoice.status
            orm.due_date = invoice.due_date
            orm.updated_at = invoice.updated_at
            
            # Simplified item sync for this demo phase
            # Assuming items are not modified after DRAFT creation, just added
            existing_item_ids = {item.id for item in orm.items}
            for item in invoice.items:
                if item.id not in existing_item_ids:
                    orm_item = ORMInvoiceItem(
                        id=item.id,
                        invoice_id=invoice.id,
                        service_offering_id=item.service_offering_id,
                        service_name=item.service_name,
                        quantity=float(item.quantity),
                        unit_price=float(item.unit_price),
                        total_price=float(item.total_price),
                        service_order_id=item.service_order_id
                    )
                    orm.items.append(orm_item)
