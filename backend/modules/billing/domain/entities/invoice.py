import uuid
from datetime import UTC, datetime
from decimal import Decimal

from modules.core.domain.id_generator import IdGenerator
from shared_kernel.contracts.aggregate_root import AggregateRoot


class InvoiceItem:
    def __init__(
        self,
        service_offering_id: uuid.UUID,
        service_name: str,
        quantity: Decimal,
        unit_price: Decimal,
        total_price: Decimal,
        service_order_id: uuid.UUID | None = None,
        id: uuid.UUID | None = None
    ):
        self.id = id or IdGenerator.generate()
        self.service_offering_id = service_offering_id
        self.service_name = service_name
        self.quantity = quantity
        self.unit_price = unit_price
        self.total_price = total_price
        self.service_order_id = service_order_id


class Invoice(AggregateRoot):
    def __init__(
        self,
        company_id: uuid.UUID,
        tenant_id: uuid.UUID,
        reference_month: str,  # Format: "YYYY-MM"
        id: uuid.UUID | None = None,
        status: str = "DRAFT",
        issue_date: datetime | None = None,
        due_date: datetime | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self.tenant_id = tenant_id
        self.company_id = company_id
        self.reference_month = reference_month
        self.status = status
        self.issue_date = issue_date or datetime.now(UTC)
        self.due_date = due_date
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)
        self.items: list[InvoiceItem] = []

    @property
    def id(self) -> uuid.UUID:
        return self._id

    @property
    def total_amount(self) -> Decimal:
        return sum(item.total_price for item in self.items)
        
    def add_item(
        self,
        service_offering_id: uuid.UUID,
        service_name: str,
        quantity: Decimal,
        unit_price: Decimal,
        total_price: Decimal,
        service_order_id: uuid.UUID | None = None
    ) -> InvoiceItem:
        if self.status != "DRAFT":
            raise ValueError(f"Cannot add items to an invoice in {self.status} status")
            
        item = InvoiceItem(
            service_offering_id=service_offering_id,
            service_name=service_name,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price,
            service_order_id=service_order_id
        )
        self.items.append(item)
        self.updated_at = datetime.now(UTC)
        return item
        
    def approve(self) -> None:
        if self.status != "DRAFT":
            raise ValueError(f"Cannot approve invoice in {self.status} status")
        self.status = "APPROVED"
        self.updated_at = datetime.now(UTC)

    def mark_as_paid(self) -> None:
        if self.status != "APPROVED":
            raise ValueError(f"Cannot mark invoice as paid in {self.status} status")
        self.status = "PAID"
        self.updated_at = datetime.now(UTC)
