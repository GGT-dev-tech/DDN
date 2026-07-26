from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Any
from uuid import UUID

import uuid6

from shared_kernel.contracts.aggregate_root import AggregateRoot


class ServiceStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ARCHIVED = "ARCHIVED"

@dataclass
class ServiceOfferingAttribute:
    service_offering_id: UUID
    service_attribute_id: UUID
    allowed_values: list[Any]

@dataclass
class ServiceOffering(AggregateRoot):
    _id: UUID
    tenant_id: UUID
    name: str
    description: str
    category: str
    status: ServiceStatus
    default_uom_id: UUID
    effective_date: date
    end_date: date | None
    attributes: list[ServiceOfferingAttribute] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    _version: int = field(default=1)

    @property
    def id(self) -> UUID:
        return self._id

    @property
    def version(self) -> int:
        return self._version

    @classmethod
    def draft(
        cls,
        tenant_id: UUID,
        name: str,
        description: str,
        category: str,
        default_uom_id: UUID,
        effective_date: date,
        end_date: date | None = None
    ) -> "ServiceOffering":
        """
        Factory method to draft a new ServiceOffering.
        """
        if not name.strip():
            raise ValueError("ServiceOffering name cannot be empty")
        if not category.strip():
            raise ValueError("ServiceOffering category cannot be empty")
            
        offering = cls(
            _id=uuid6.uuid7(),
            tenant_id=tenant_id,
            name=name.strip(),
            description=description.strip(),
            category=category.strip(),
            status=ServiceStatus.DRAFT,
            default_uom_id=default_uom_id,
            effective_date=effective_date,
            end_date=end_date,
        )
        return offering
        
    def activate(self) -> None:
        """Activate the Service Offering."""
        if self.status in [ServiceStatus.ARCHIVED]:
            raise ValueError("Cannot activate an archived service offering")
            
        self.status = ServiceStatus.ACTIVE
        self.updated_at = datetime.utcnow()
        self._version += 1
        
    def archive(self) -> None:
        """Archive the Service Offering."""
        self.status = ServiceStatus.ARCHIVED
        self.updated_at = datetime.utcnow()
        self._version += 1
        
    def add_attribute(self, attribute_id: UUID, allowed_values: list[Any]) -> None:
        """
        Bind a ServiceAttribute to this offering, specifying the subset of allowed_values.
        """
        if self.status == ServiceStatus.ARCHIVED:
            raise ValueError("Cannot add attributes to an archived service offering")
            
        if any(attr.service_attribute_id == attribute_id for attr in self.attributes):
            raise ValueError("Attribute is already bound to this service offering")
            
        self.attributes.append(ServiceOfferingAttribute(
            service_offering_id=self.id,
            service_attribute_id=attribute_id,
            allowed_values=allowed_values
        ))
        
        self.updated_at = datetime.utcnow()
        self._version += 1
