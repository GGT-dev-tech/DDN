from sqlalchemy.ext.asyncio import AsyncSession
from modules.core.context import ContextAccessor
from modules.fleet.application.repositories import FleetRepository
from modules.routing.application.dto import (
    AssignRouteResourcesRequestDTO,
    RouteResponseDTO,
    StopResponseDTO,
)
from modules.routing.application.repositories import RoutingRepository


class AssignRouteResourcesUseCase:
    def __init__(
        self,
        session: AsyncSession,
        routing_repository: RoutingRepository,
        fleet_repository: FleetRepository,
        context_accessor: ContextAccessor
    ):
        self.session = session
        self.routing_repository = routing_repository
        self.fleet_repository = fleet_repository
        self.context_accessor = context_accessor

    async def execute(self, dto: AssignRouteResourcesRequestDTO) -> RouteResponseDTO:
        tenant_ctx = self.context_accessor.tenant()
        if not tenant_ctx or not tenant_ctx.tenant_id:
            raise ValueError("Tenant context is required")
            
        route = await self.routing_repository.get_by_id(dto.route_id)
        if not route:
            raise ValueError(f"Route with id {dto.route_id} not found")
            
        vehicle = await self.fleet_repository.get_vehicle_by_id(dto.vehicle_id)
        if not vehicle:
            raise ValueError(f"Vehicle with id {dto.vehicle_id} not found")
            
        driver = await self.fleet_repository.get_driver_by_id(dto.driver_id)
        if not driver:
            raise ValueError(f"Driver with id {dto.driver_id} not found")
            
        vehicle.check_availability()
        driver.check_availability()
        
        driver.assign()
        route.assign_resources(vehicle.id, driver.id)
        
        await self.fleet_repository.save_driver(driver)
        await self.routing_repository.save(route)
        
        driver.clear_events()
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
