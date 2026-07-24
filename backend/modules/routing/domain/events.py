from dataclasses import dataclass
from uuid import UUID
from typing import Optional
from modules.core.domain.events import DomainEvent

@dataclass(frozen=True)
class RouteCreated(DomainEvent):
    route_id: UUID
    tenant_id: UUID
    execution_date: str

@dataclass(frozen=True)
class RoutePlanned(DomainEvent):
    route_id: UUID

@dataclass(frozen=True)
class RouteAssigned(DomainEvent):
    route_id: UUID
    vehicle_id: UUID
    driver_id: UUID

@dataclass(frozen=True)
class RouteStarted(DomainEvent):
    route_id: UUID

@dataclass(frozen=True)
class RouteCompleted(DomainEvent):
    route_id: UUID

@dataclass(frozen=True)
class RouteCancelled(DomainEvent):
    route_id: UUID

@dataclass(frozen=True)
class StopAddedToRoute(DomainEvent):
    route_id: UUID
    stop_id: UUID
    order: int

@dataclass(frozen=True)
class StopRemovedFromRoute(DomainEvent):
    route_id: UUID
    stop_id: UUID
