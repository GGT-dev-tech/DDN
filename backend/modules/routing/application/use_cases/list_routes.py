from modules.routing.application.dto import RouteResponseDTO, StopResponseDTO
from modules.routing.application.repositories import RoutingRepository

from uuid import UUID

class ListRoutes:
    def __init__(self, repository: RoutingRepository):
        self.repository = repository

    async def execute(self, tenant_id: UUID) -> list[RouteResponseDTO]:
        routes = await self.repository.list_routes(tenant_id)
        return [
            RouteResponseDTO(
                id=r.id,
                tenant_id=r.tenant_id,
                execution_date=r.execution_date,
                status=r.status,
                estimated_volume=r.estimated_volume,
                estimated_weight=r.estimated_weight,
                planned_distance=r.planned_distance,
                planned_duration=r.planned_duration,
                vehicle_id=r.vehicle_id,
                driver_id=r.driver_id,
                stops=[
                    StopResponseDTO(
                        id=s.id,
                        latitude=s.location.latitude,
                        longitude=s.location.longitude,
                        address=s.location.address,
                        order=s.order,
                        status=s.status
                    ) for s in r.stops
                ]
            )
            for r in routes
        ]
