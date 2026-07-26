from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID

import uuid6

from shared_kernel.contracts.aggregate_root import AggregateRoot


class UOMBaseType(str, Enum):
    VOLUME = "VOLUME"
    WEIGHT = "WEIGHT"
    UNIT = "UNIT"
    DISTANCE = "DISTANCE"
    TIME = "TIME"

@dataclass
class UnitOfMeasure(AggregateRoot):
    _id: UUID
    tenant_id: UUID
    symbol: str
    name: str
    base_type: UOMBaseType
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
        symbol: str,
        name: str,
        base_type: UOMBaseType,
    ) -> "UnitOfMeasure":
        """
        Factory method to create a new UnitOfMeasure.
        """
        symbol = symbol.strip()
        if not symbol:
            raise ValueError("UnitOfMeasure symbol cannot be empty")
        if not name.strip():
            raise ValueError("UnitOfMeasure name cannot be empty")

        uom = cls(
            _id=uuid6.uuid7(),
            tenant_id=tenant_id,
            symbol=symbol,
            name=name.strip(),
            base_type=base_type,
        )
        return uom

    def update(self, name: str) -> None:
        """
        Update mutable fields of a UnitOfMeasure.
        Symbol and base_type are immutable to prevent cascading errors across systems.
        """
        if not name.strip():
            raise ValueError("UnitOfMeasure name cannot be empty")
        
        self.name = name.strip()
        self.updated_at = datetime.utcnow()
        self._version += 1
