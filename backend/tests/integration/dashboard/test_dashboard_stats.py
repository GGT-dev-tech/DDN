from datetime import date
from uuid import UUID

import pytest
from fastapi import Header
from httpx import AsyncClient
from uuid6 import uuid7

from apps.api_gateway.src.main import app
from modules.fleet.domain.entities.vehicle import VehicleStatus, VehicleType
from modules.fleet.infrastructure.orm_models import VehicleModel
from modules.identity.dependencies import require_tenant
from modules.routing.domain.entities.route import RouteStatus, StopStatus
from modules.routing.infrastructure.orm_models import RouteModel, StopModel


@pytest.fixture
def test_tenant_id():
    return uuid7()

@pytest.fixture
def other_tenant_id():
    return uuid7()

@pytest.fixture
async def setup_dashboard_data(db_session, test_tenant_id, other_tenant_id):
    # Tenant A Data
    route1 = RouteModel(id=uuid7(), tenant_id=test_tenant_id, execution_date=date.today(), status=RouteStatus.IN_PROGRESS)
    route2 = RouteModel(id=uuid7(), tenant_id=test_tenant_id, execution_date=date.today(), status=RouteStatus.IN_PROGRESS)
    route3 = RouteModel(id=uuid7(), tenant_id=test_tenant_id, execution_date=date.today(), status=RouteStatus.DRAFT)

    
    vehicle1 = VehicleModel(tenant_id=test_tenant_id, license_plate="ABC-1234", vehicle_type=VehicleType.VAN, capacity_volume=10, capacity_weight=1000, status=VehicleStatus.ACTIVE)
    vehicle2 = VehicleModel(tenant_id=test_tenant_id, license_plate="XYZ-9876", vehicle_type=VehicleType.VAN, capacity_volume=10, capacity_weight=1000, status=VehicleStatus.ACTIVE)
    vehicle3 = VehicleModel(tenant_id=test_tenant_id, license_plate="MNO-5555", vehicle_type=VehicleType.VAN, capacity_volume=10, capacity_weight=1000, status=VehicleStatus.MAINTENANCE)

    db_session.add_all([route1, route2, route3, vehicle1, vehicle2, vehicle3])
    await db_session.commit()

    
    stop1 = StopModel(route_id=route1.id, latitude=0, longitude=0, address="A", order=1, status=StopStatus.SCHEDULED)
    stop2 = StopModel(route_id=route1.id, latitude=0, longitude=0, address="B", order=2, status=StopStatus.SCHEDULED)
    stop3 = StopModel(route_id=route1.id, latitude=0, longitude=0, address="C", order=3, status=StopStatus.ARRIVED)
    
    db_session.add_all([stop1, stop2, stop3])
    await db_session.commit()


    # Tenant B Data (Should not be visible to Tenant A)
    route_b = RouteModel(id=uuid7(), tenant_id=other_tenant_id, execution_date=date.today(), status=RouteStatus.IN_PROGRESS)
    vehicle_b = VehicleModel(id=uuid7(), tenant_id=other_tenant_id, license_plate="DEF-1234", vehicle_type=VehicleType.VAN, capacity_volume=10, capacity_weight=1000, status=VehicleStatus.ACTIVE)
    db_session.add_all([route_b, vehicle_b])
    await db_session.commit()


    stop_b = StopModel(id=uuid7(), route_id=route_b.id, latitude=0, longitude=0, address="D", order=1, status=StopStatus.SCHEDULED)
    db_session.add(stop_b)
    await db_session.commit()


@pytest.fixture
def override_require_tenant():
    async def mock_require_tenant(x_tenant_id: str = Header(...)) -> UUID:
        return UUID(x_tenant_id)
    app.dependency_overrides[require_tenant] = mock_require_tenant
    yield
    app.dependency_overrides.pop(require_tenant, None)

@pytest.mark.asyncio
async def test_dashboard_stats_empty_tenant(async_client: AsyncClient, test_tenant_id, override_require_tenant):
    # No data injected
    headers = {"X-Tenant-ID": str(test_tenant_id)}
    response = await async_client.get("/api/v1/dashboard/stats", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["active_routes"] == 0
    assert data["available_vehicles"] == 0
    assert data["pending_deliveries"] == 0

@pytest.mark.asyncio
async def test_dashboard_stats_with_data(async_client: AsyncClient, setup_dashboard_data, test_tenant_id, override_require_tenant):
    headers = {"X-Tenant-ID": str(test_tenant_id)}
    response = await async_client.get("/api/v1/dashboard/stats", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["active_routes"] == 2 # 2 IN_PROGRESS
    assert data["available_vehicles"] == 2 # 2 ACTIVE
    assert data["pending_deliveries"] == 2 # 2 SCHEDULED (1 is ARRIVED)

@pytest.mark.asyncio
async def test_dashboard_stats_tenant_isolation(async_client: AsyncClient, setup_dashboard_data, other_tenant_id, override_require_tenant):
    headers = {"X-Tenant-ID": str(other_tenant_id)}
    response = await async_client.get("/api/v1/dashboard/stats", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    # Should only see Tenant B's data
    assert data["active_routes"] == 1
    assert data["available_vehicles"] == 1
    assert data["pending_deliveries"] == 1
