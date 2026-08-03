import uuid
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from enum import Enum

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator


class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


@dataclass
class InvoiceItem:
    id: uuid.UUID
    service_order_id: uuid.UUID
    description: str
    quantity: float
    unit_price: float
    total_price: float


@dataclass
class Invoice(AggregateRoot):
    id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID
    reference_date: date
    status: InvoiceStatus
    total_amount: float
    due_date: date | None = None
    items: list[InvoiceItem] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(cls, tenant_id: uuid.UUID, company_id: uuid.UUID, reference_date: date) -> "Invoice":
        return cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            company_id=company_id,
            reference_date=reference_date,
            status=InvoiceStatus.DRAFT,
            total_amount=0.0
        )

    def add_item(self, service_order_id: uuid.UUID, description: str, quantity: float, unit_price: float) -> InvoiceItem:
        if self.status != InvoiceStatus.DRAFT:
            raise ValueError("Cannot add items to a non-draft invoice")
            
        total_price = quantity * unit_price
        item = InvoiceItem(
            id=IdGenerator.generate(),
            service_order_id=service_order_id,
            description=description,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price
        )
        self.items.append(item)
        self._recalculate_total()
        return item

    def _recalculate_total(self) -> None:
        self.total_amount = sum(item.total_price for item in self.items)
        self.updated_at = datetime.now(UTC)

    def issue(self, due_date: date) -> None:
        if self.status != InvoiceStatus.DRAFT:
            raise ValueError("Only draft invoices can be issued")
        if not self.items:
            raise ValueError("Cannot issue an empty invoice")
            
        self.status = InvoiceStatus.ISSUED
        self.due_date = due_date
        self.updated_at = datetime.now(UTC)

    def mark_as_paid(self) -> None:
        if self.status != InvoiceStatus.ISSUED:
            raise ValueError("Only issued invoices can be marked as paid")
            
        self.status = InvoiceStatus.PAID
        self.updated_at = datetime.now(UTC)
