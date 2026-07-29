import uuid
from datetime import date, time
from decimal import Decimal
import pytest

from modules.routing.application.services.route_planner_service import (
    RequirementRepository,
    RoutePlannerService,
    RouteRepository,
)
from modules.routing.domain.entities.collection_requirement import (
    CollectionRequirement,
)
from modules.routing.domain.entities.route import Route
from modules.routing.domain.value_objects import (
    Frequency,
    Location,
    Recurrence,
    RequirementStatus,
    Weekday,
)


class MockRequirementRepository(RequirementRepository):
    def __init__(self, requirements):
        self.requirements = requirements

    async def list_active_requirements(self, tenant_id) -> list[CollectionRequirement]:
        return self.requirements


class MockRouteRepository(RouteRepository):
    def __init__(self):
        self.saved_routes = []

    async def save(self, route: Route) -> None:
        self.saved_routes.append(route)


@pytest.mark.asyncio
async def test_route_planner_generates_routes():
    tenant_id = uuid.uuid4()
    
    # 2026-07-29 is a Wednesday. Let's create two requirements for Wednesday and one for Thursday.
    req_wed1 = CollectionRequirement(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        origin_reference="plan1",
        origin_item_id="item1",
        service_name="Waste A",
        location=Location(latitude=0.0, longitude=0.0, address="A"),
        quantity=Decimal("600.0"),
        unit_of_measure="KG",
        recurrence=Recurrence(
            frequency=Frequency.WEEKLY,
            interval=1,
            weekdays=[Weekday.WEDNESDAY],
            start_time=time(8, 0),
            end_time=time(10, 0)
        ),
        status=RequirementStatus.ACTIVE
    )
    req_wed2 = CollectionRequirement(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        origin_reference="plan1",
        origin_item_id="item2",
        service_name="Waste B",
        location=Location(latitude=0.0, longitude=0.0, address="B"),
        quantity=Decimal("500.0"),
        unit_of_measure="KG",
        recurrence=Recurrence(
            frequency=Frequency.WEEKLY,
            interval=1,
            weekdays=[Weekday.WEDNESDAY],
            start_time=time(8, 0),
            end_time=time(10, 0)
        ),
        status=RequirementStatus.ACTIVE
    )
    req_thu = CollectionRequirement(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        origin_reference="plan1",
        origin_item_id="item3",
        service_name="Waste C",
        location=Location(latitude=0.0, longitude=0.0, address="C"),
        quantity=Decimal("100.0"),
        unit_of_measure="KG",
        recurrence=Recurrence(
            frequency=Frequency.WEEKLY,
            interval=1,
            weekdays=[Weekday.THURSDAY],
            start_time=time(8, 0),
            end_time=time(10, 0)
        ),
        status=RequirementStatus.ACTIVE
    )
    
    req_repo = MockRequirementRepository([req_wed1, req_wed2, req_thu])
    route_repo = MockRouteRepository()
    
    planner = RoutePlannerService(req_repo, route_repo)
    
    target_date = date(2026, 7, 29) # Wednesday
    routes = await planner.plan_daily_routes(tenant_id, target_date)
    
    # We have 1100.0 total for Wednesday. Max capacity is 1000.0
    # The planner should generate 2 routes
    assert len(routes) == 2
    assert len(routes[0].stops) == 1
    assert len(routes[1].stops) == 1
    
    # Thursday requirement is ignored
    
    # Check saved routes
    assert len(route_repo.saved_routes) == 2
