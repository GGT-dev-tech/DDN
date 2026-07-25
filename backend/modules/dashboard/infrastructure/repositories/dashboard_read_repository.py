import abc
from uuid import UUID
from typing import Dict
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from modules.routing.infrastructure.orm_models import RouteModel, StopModel
from modules.fleet.infrastructure.orm_models import VehicleModel
from modules.routing.domain.entities.route import RouteStatus, StopStatus
from modules.fleet.domain.entities.vehicle import VehicleStatus

class IDashboardReadRepository(abc.ABC):
    @abc.abstractmethod
    async def get_stats(self, tenant_id: UUID) -> Dict[str, int]:
        pass

class DashboardReadRepository(IDashboardReadRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_stats(self, tenant_id: UUID) -> Dict[str, int]:
        # Active Routes: routes IN_PROGRESS for the given tenant
        active_routes_query = select(func.count(RouteModel.id)).where(
            RouteModel.tenant_id == tenant_id,
            RouteModel.status == RouteStatus.IN_PROGRESS
        )
        active_routes_result = await self.session.execute(active_routes_query)
        active_routes = active_routes_result.scalar_one()

        # Available Vehicles: vehicles ACTIVE for the given tenant
        available_vehicles_query = select(func.count(VehicleModel.id)).where(
            VehicleModel.tenant_id == tenant_id,
            VehicleModel.status == VehicleStatus.ACTIVE
        )
        available_vehicles_result = await self.session.execute(available_vehicles_query)
        available_vehicles = available_vehicles_result.scalar_one()

        # Pending Deliveries: stops SCHEDULED belonging to routes of the given tenant
        pending_deliveries_query = select(func.count(StopModel.id)).join(
            RouteModel, RouteModel.id == StopModel.route_id
        ).where(
            RouteModel.tenant_id == tenant_id,
            StopModel.status == StopStatus.SCHEDULED
        )
        pending_deliveries_result = await self.session.execute(pending_deliveries_query)
        pending_deliveries = pending_deliveries_result.scalar_one()

        return {
            "active_routes": active_routes,
            "available_vehicles": available_vehicles,
            "pending_deliveries": pending_deliveries
        }
