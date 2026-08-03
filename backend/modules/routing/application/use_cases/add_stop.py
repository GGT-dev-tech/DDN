
from sqlalchemy.ext.asyncio import AsyncSession

from modules.routing.application.dto import AddStopRequestDTO, RouteResponseDTO, StopResponseDTO
from modules.routing.application.repositories import RoutingRepository
from modules.routing.domain.entities.route import Location


class AddStopUseCase:
    def __init__(self, session: AsyncSession, routing_repository: RoutingRepository):
        self.session = session
        self.routing_repository = routing_repository

    async def execute(self, dto: AddStopRequestDTO) -> RouteResponseDTO:
        route = await self.routing_repository.get_by_id(dto.route_id)
        if not route:
            raise ValueError(f"Route with id {dto.route_id} not found")
            
        location = Location(
            latitude=dto.location.latitude,
            longitude=dto.location.longitude,
            address=dto.location.address
        )
        
        route.add_stop(location, dto.order)
            
        await self.routing_repository.save(route)
        route.clear_events()
        await self.session.commit()
            
        return RouteResponseDTO(
            id=route.id,
            execution_date=route.execution_date,
            status=route.status.value,
            estimated_volume=route.estimated_volume,
            estimated_weight=route.estimated_weight,
            planned_distance=route.planned_distance,
            planned_duration=route.planned_duration,
            vehicle_id=route.vehicle_id,
            driver_id=route.driver_id,
            stops=[
                StopResponseDTO(
                    id=s.id,
                    latitude=s.location.latitude,
                    longitude=s.location.longitude,
                    address=s.location.address,
                    order=s.order,
                    status=s.status.value
                ) for s in route.stops
            ]
        )
