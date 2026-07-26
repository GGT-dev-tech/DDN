from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

import uuid6

from shared_kernel.contracts.aggregate_root import AggregateRoot


class AttributeType(str, Enum):
    WASTE_TYPE = "WASTE_TYPE"
    CONTAINER_TYPE = "CONTAINER_TYPE"
    FREQUENCY = "FREQUENCY"
    CAPACITY = "CAPACITY"
    NUMERIC = "NUMERIC"

@dataclass
class ServiceAttribute(AggregateRoot):
    _id: UUID
    tenant_id: UUID
    name: str
    attribute_type: AttributeType
    possible_values: list[Any]
    is_required: bool
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
    def create(
        cls,
        tenant_id: UUID,
        name: str,
        attribute_type: AttributeType,
        possible_values: list[Any],
        is_required: bool = False
    ) -> "ServiceAttribute":
        """
        Factory method to create a new ServiceAttribute.
        """
        if not name.strip():
            raise ValueError("ServiceAttribute name cannot be empty")
        
        # A bit of domain validation depending on the attribute_type could go here.
        if not isinstance(possible_values, list):
            raise ValueError("possible_values must be a list")

        attr = cls(
            _id=uuid6.uuid7(),
            tenant_id=tenant_id,
            name=name.strip(),
            attribute_type=attribute_type,
            possible_values=possible_values,
            is_required=is_required
        )
        return attr

    def update(
        self,
        name: str,
        possible_values: list[Any],
        is_required: bool
    ) -> None:
        """
        Update the ServiceAttribute. 
        Note that updating possible_values might impact services using it, 
        so implementations should ensure backward compatibility or soft-updates.
        """
        if not name.strip():
            raise ValueError("ServiceAttribute name cannot be empty")
        if not isinstance(possible_values, list):
            raise ValueError("possible_values must be a list")
            
        self.name = name.strip()
        self.possible_values = possible_values
        self.is_required = is_required
        self.updated_at = datetime.utcnow()
        self._version += 1
