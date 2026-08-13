import uuid
from datetime import UTC, datetime
from decimal import Decimal

from modules.core.domain.id_generator import IdGenerator
from modules.quotations.domain.events import (
    QuotationApproved,
    QuotationDraftCreated,
    QuotationExpired,
    QuotationItemAdded,
    QuotationPriced,
    QuotationRejected,
    QuotationSnapshotGenerated,
    QuotationSubmitted,
)
from modules.quotations.domain.value_objects import QuotationItemSnapshot, QuotationStatus
from shared_kernel.contracts.aggregate_root import AggregateRoot


class QuotationItem:
    def __init__(
        self,
        service_offering_id: uuid.UUID,
        unit_of_measure_id: uuid.UUID,
        quantity: Decimal,
        id: uuid.UUID | None = None,
        snapshot: QuotationItemSnapshot | None = None
    ):
        self.id = id or IdGenerator.generate()
        self.service_offering_id = service_offering_id
        self.unit_of_measure_id = unit_of_measure_id
        self.quantity = quantity
        self.snapshot = snapshot

    def attach_snapshot(self, snapshot: QuotationItemSnapshot) -> None:
        self.snapshot = snapshot


class Quotation(AggregateRoot):
    def __init__(
        self,
        company_id: uuid.UUID,
        tenant_id: uuid.UUID,
        id: uuid.UUID | None = None,
        price_table_id: uuid.UUID | None = None,
        status: QuotationStatus = QuotationStatus.DRAFT,
        expires_at: datetime | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self.tenant_id = tenant_id
        self.company_id = company_id
        self.price_table_id = price_table_id
        self.status = status
        self.expires_at = expires_at
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)
        self.items: list[QuotationItem] = []

    @property
    def id(self) -> uuid.UUID:
        return self._id
        
    @property
    def version(self) -> int:
        return 1

    @classmethod
    def create_draft(cls, company_id: uuid.UUID, tenant_id: uuid.UUID, expires_at: datetime, price_table_id: uuid.UUID | None = None) -> "Quotation":
        quotation = cls(company_id=company_id, tenant_id=tenant_id, expires_at=expires_at, price_table_id=price_table_id)
        quotation.add_event(QuotationDraftCreated(
            quotation_id=quotation.id,
            company_id=company_id,
            tenant_id=tenant_id
        ))
        return quotation

    def add_item(self, service_offering_id: uuid.UUID, unit_of_measure_id: uuid.UUID, quantity: Decimal) -> QuotationItem:
        if self.status != QuotationStatus.DRAFT:
            raise ValueError(f"Cannot add items to a quotation in {self.status.value} status")
        
        item = QuotationItem(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            quantity=quantity
        )
        self.items.append(item)
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationItemAdded(
            quotation_id=self.id,
            item_id=item.id,
            service_offering_id=service_offering_id
        ))
        return item

    def mark_as_priced(self) -> None:
        if self.status != QuotationStatus.DRAFT:
            raise ValueError(f"Only DRAFT quotations can be priced, current is {self.status.value}")
        
        # Verify all items have a snapshot
        for item in self.items:
            if not item.snapshot:
                raise ValueError(f"Item {item.id} is missing a snapshot. Cannot mark as PRICED.")
                
        self.status = QuotationStatus.PRICED
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationSnapshotGenerated(quotation_id=self.id, tenant_id=self.tenant_id))
        self.add_event(QuotationPriced(quotation_id=self.id, tenant_id=self.tenant_id))

    def submit(self) -> None:
        if self.status not in (QuotationStatus.DRAFT, QuotationStatus.PRICED):
            raise ValueError(f"Cannot submit a quotation in {self.status.value} status")
            
        if not self.items:
            raise ValueError("Cannot submit an empty quotation")
            
        for item in self.items:
            if not item.snapshot:
                raise ValueError("All items must be priced and have a snapshot before submitting")

        self.status = QuotationStatus.SUBMITTED
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationSubmitted(quotation_id=self.id, tenant_id=self.tenant_id))

    def approve(self) -> None:
        if self.status != QuotationStatus.SUBMITTED:
            raise ValueError(f"Quotation must be SUBMITTED to be approved. Current is {self.status.value}")
            
        self.status = QuotationStatus.APPROVED
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationApproved(
            quotation_id=self.id,
            company_id=self.company_id,
            tenant_id=self.tenant_id
        ))

    def reject(self) -> None:
        if self.status not in (QuotationStatus.SUBMITTED, QuotationStatus.DRAFT, QuotationStatus.PRICED):
            raise ValueError(f"Cannot reject quotation in {self.status.value} status")
            
        self.status = QuotationStatus.REJECTED
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationRejected(quotation_id=self.id, tenant_id=self.tenant_id))

    def expire(self) -> None:
        if self.status in (QuotationStatus.APPROVED, QuotationStatus.REJECTED, QuotationStatus.EXPIRED):
            return
            
        self.status = QuotationStatus.EXPIRED
        self.updated_at = datetime.now(UTC)
        
        self.add_event(QuotationExpired(quotation_id=self.id, tenant_id=self.tenant_id))
