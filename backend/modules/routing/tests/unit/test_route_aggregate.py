from datetime import date

import pytest

from modules.core.domain.id_generator import IdGenerator
from modules.routing.domain.entities.route import Location, Route, RouteStatus
from modules.routing.domain.events import (
    RouteCreated,
    StopAddedToRoute,
)
from modules.routing.domain.exceptions import (
    DuplicateStopOrderException,
    InvalidRouteStatusTransitionException,
    RouteModificationException,
    RouteWithoutStopsException,
    StopModificationException,
)


# Fixtures
@pytest.fixture
def tenant_id():
    return IdGenerator.generate()

@pytest.fixture
def execution_date():
    return date(2026, 8, 1)

@pytest.fixture
def sample_location():
    return Location(latitude=-23.5505, longitude=-46.6333, address="Centro, SP")

def test_route_creation(tenant_id, execution_date):
    route = Route.create(tenant_id=tenant_id, execution_date=execution_date)
    
    assert route.tenant_id == tenant_id
    assert route.execution_date == execution_date
    assert route.status == RouteStatus.DRAFT
    assert len(route.stops) == 0
    
    events = route.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], RouteCreated)

def test_add_stop_to_route(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.clear_events()
    
    stop = route.add_stop(location=sample_location, order=1)
    
    assert stop.order == 1
    assert len(route.stops) == 1
    
    events = route.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], StopAddedToRoute)
    assert events[0].stop_id == stop.id

def test_duplicate_stop_order_raises_exception(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(location=sample_location, order=1)
    
    with pytest.raises(DuplicateStopOrderException):
        route.add_stop(location=sample_location, order=1)

def test_plan_route_without_stops_raises_exception(tenant_id, execution_date):
    route = Route.create(tenant_id, execution_date)
    
    with pytest.raises(RouteWithoutStopsException):
        route.plan()

def test_plan_route_success(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(sample_location, 1)
    
    route.plan()
    assert route.status == RouteStatus.PLANNED

def test_start_route_without_stops_raises_exception(tenant_id, execution_date):
    route = Route.create(tenant_id, execution_date)
    # Force status to PLANNED for testing
    route.status = RouteStatus.PLANNED
    
    with pytest.raises(RouteWithoutStopsException):
        route.start()

def test_remove_stop_from_in_progress_route_raises_exception(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    stop = route.add_stop(sample_location, 1)
    route.plan()
    route.assign_resources(IdGenerator.generate(), IdGenerator.generate())
    route.start()
    
    assert route.status == RouteStatus.IN_PROGRESS
    
    with pytest.raises(StopModificationException):
        route.remove_stop(stop.id)

def test_add_stop_to_completed_route_raises_exception(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(sample_location, 1)
    route.plan()
    route.assign_resources(IdGenerator.generate(), IdGenerator.generate())
    route.start()
    route.complete()
    
    assert route.status == RouteStatus.COMPLETED
    
    with pytest.raises(RouteModificationException):
        route.add_stop(sample_location, 2)

def test_cancel_completed_route_raises_exception(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(sample_location, 1)
    route.plan()
    route.assign_resources(IdGenerator.generate(), IdGenerator.generate())
    route.start()
    route.complete()
    
    with pytest.raises(InvalidRouteStatusTransitionException):
        route.cancel()

def test_cancel_in_progress_route_success(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(sample_location, 1)
    route.plan()
    route.assign_resources(IdGenerator.generate(), IdGenerator.generate())
    route.start()
    
    # Should not raise exception
    route.cancel()
    assert route.status == RouteStatus.CANCELLED

def test_start_cancelled_route_raises_exception(tenant_id, execution_date, sample_location):
    route = Route.create(tenant_id, execution_date)
    route.add_stop(sample_location, 1)
    route.cancel()
    
    with pytest.raises(InvalidRouteStatusTransitionException):
        route.start()
