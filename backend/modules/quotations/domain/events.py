from dataclasses import dataclass
from uuid import UUID
from datetime import datetime

from modules.core.domain.events import DomainEvent


@dataclass(frozen=True)
class QuotationDraftCreated(DomainEvent):
    quotation_id: UUID
    company_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationItemAdded(DomainEvent):
    quotation_id: UUID
    item_id: UUID
    service_offering_id: UUID


@dataclass(frozen=True)
class QuotationPriced(DomainEvent):
    quotation_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationSnapshotGenerated(DomainEvent):
    quotation_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationSubmitted(DomainEvent):
    quotation_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationApproved(DomainEvent):
    quotation_id: UUID
    company_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationRejected(DomainEvent):
    quotation_id: UUID
    tenant_id: UUID


@dataclass(frozen=True)
class QuotationExpired(DomainEvent):
    quotation_id: UUID
    tenant_id: UUID
