from uuid import UUID
from dataclasses import dataclass
from shared_kernel.value_objects.base import ValueObject

@dataclass(frozen=True)
class TenantId(ValueObject):
    value: UUID

@dataclass(frozen=True)
class RouteId(ValueObject):
    value: UUID

@dataclass(frozen=True)
class VehicleId(ValueObject):
    value: UUID
