from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from uuid import UUID

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.routing.domain.events import (
    RouteAssigned,
    RouteCancelled,
    RouteCompleted,
    RouteCreated,
    RoutePlanned,
    RouteStarted,
    StopAddedToRoute,
    StopRemovedFromRoute,
)
from modules.routing.domain.exceptions import (
    DuplicateStopOrderException,
    InvalidRouteStatusTransitionException,
    RouteModificationException,
    RouteWithoutStopsException,
    StopModificationException,
)


class RouteStatus(Enum):
    DRAFT = "DRAFT"
    PLANNED = "PLANNED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

@dataclass(frozen=True)
class Location:
    latitude: float
    longitude: float
    address: str

class StopStatus(Enum):
    SCHEDULED = "SCHEDULED"
    ARRIVED = "ARRIVED"
    COLLECTED = "COLLECTED"
    SKIPPED = "SKIPPED"

@dataclass
class Stop:
    id: UUID
    location: Location
    order: int
    status: StopStatus = StopStatus.SCHEDULED

@dataclass
class Route(AggregateRoot):
    id: UUID
    tenant_id: UUID
    execution_date: date
    status: RouteStatus
    
    # Operational Capacity
    estimated_volume: float | None = None
    estimated_weight: float | None = None
    planned_distance: float | None = None
    planned_duration: float | None = None
    
    # Fleet Assignment
    vehicle_id: UUID | None = None
    driver_id: UUID | None = None
    
    stops: list[Stop] = field(default_factory=list)

    @classmethod
    def create(cls, tenant_id: UUID, execution_date: date) -> "Route":
        route = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            execution_date=execution_date,
            status=RouteStatus.DRAFT,
            stops=[]
        )
        route.add_event(RouteCreated(
            route_id=route.id,
            tenant_id=route.tenant_id,
            execution_date=route.execution_date.isoformat()
        ))
        return route

    def add_stop(self, location: Location, order: int) -> Stop:
        if self.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise RouteModificationException(f"Cannot add stops to a {self.status.value} route.")
        
        # Invariant: order must be unique
        if any(s.order == order for s in self.stops):
            raise DuplicateStopOrderException(f"Stop with order {order} already exists in route {self.id}.")
            
        stop = Stop(id=IdGenerator.generate(), location=location, order=order)
        self.stops.append(stop)
        
        self.add_event(StopAddedToRoute(
            route_id=self.id,
            stop_id=stop.id,
            order=stop.order
        ))
        
        return stop
        
    def remove_stop(self, stop_id: UUID):
        if self.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise RouteModificationException(f"Cannot remove stops from a {self.status.value} route.")
        
        if self.status == RouteStatus.IN_PROGRESS:
            raise StopModificationException("Cannot remove stops from an IN_PROGRESS route.")
            
        stop_to_remove = next((s for s in self.stops if s.id == stop_id), None)
        if stop_to_remove:
            self.stops.remove(stop_to_remove)
            self.add_event(StopRemovedFromRoute(route_id=self.id, stop_id=stop_id))

    def plan(self):
        if self.status != RouteStatus.DRAFT:
            raise InvalidRouteStatusTransitionException(f"Cannot transition to PLANNED from {self.status.value}.")
            
        if not self.stops:
            raise RouteWithoutStopsException("Cannot plan a route without stops.")
            
        self.status = RouteStatus.PLANNED
        self.add_event(RoutePlanned(route_id=self.id))

    def assign_resources(self, vehicle_id: UUID, driver_id: UUID):
        if self.status != RouteStatus.PLANNED:
            raise InvalidRouteStatusTransitionException(f"Cannot transition to ASSIGNED from {self.status.value}.")
            
        self.vehicle_id = vehicle_id
        self.driver_id = driver_id
        self.status = RouteStatus.ASSIGNED
        self.add_event(RouteAssigned(
            route_id=self.id,
            vehicle_id=vehicle_id,
            driver_id=driver_id
        ))

    def start(self):
        if self.status not in [RouteStatus.PLANNED, RouteStatus.ASSIGNED]:
            raise InvalidRouteStatusTransitionException(f"Cannot transition to IN_PROGRESS from {self.status.value}.")
            
        if not self.stops:
            raise RouteWithoutStopsException("Cannot start a route without stops.")
            
        self.status = RouteStatus.IN_PROGRESS
        self.add_event(RouteStarted(route_id=self.id))

    def complete(self):
        if self.status != RouteStatus.IN_PROGRESS:
            raise InvalidRouteStatusTransitionException(f"Cannot transition to COMPLETED from {self.status.value}.")
            
        self.status = RouteStatus.COMPLETED
        self.add_event(RouteCompleted(route_id=self.id))

    def cancel(self):
        if self.status == RouteStatus.COMPLETED:
            raise InvalidRouteStatusTransitionException("Cannot cancel a COMPLETED route.")
            
        self.status = RouteStatus.CANCELLED
        self.add_event(RouteCancelled(route_id=self.id))
