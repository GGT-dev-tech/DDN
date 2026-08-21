from dataclasses import dataclass
from datetime import date
from typing import Any
from uuid import UUID

from modules.core.domain.events import DomainEvent


@dataclass(frozen=True)
class UnitOfMeasureRegistered(DomainEvent):
    uom_id: UUID
    symbol: str
    base_type: str
    
@dataclass(frozen=True)
class ServiceAttributeDefined(DomainEvent):
    attribute_id: UUID
    tenant_id: UUID
    name: str
    attribute_type: str
    is_required: bool

@dataclass(frozen=True)
class ServiceOfferingDrafted(DomainEvent):
    offering_id: UUID
    tenant_id: UUID
    name: str
    category: str
    default_uom_id: UUID
    effective_date: date

@dataclass(frozen=True)
class ServiceOfferingActivated(DomainEvent):
    offering_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class ServiceOfferingArchived(DomainEvent):
    offering_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class ServiceAttributeAttached(DomainEvent):
    offering_id: UUID
    tenant_id: UUID
    attribute_id: UUID
    allowed_values: list[Any]
