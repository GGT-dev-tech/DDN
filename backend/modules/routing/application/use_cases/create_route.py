from typing import Dict, Any
from uuid import UUID

from modules.routing.application.dto import CreateRouteRequestDTO, RouteResponseDTO, StopResponseDTO
from modules.routing.application.repositories import RoutingRepository
from modules.routing.domain.entities.route import Route
from modules.core.context import ContextAccessor
from database.core.unit_of_work import UnitOfWork

class CreateRouteUseCase:
    def __init__(self, uow: UnitOfWork, routing_repository: RoutingRepository, context_accessor: ContextAccessor):
        self.uow = uow
        self.routing_repository = routing_repository
        self.context_accessor = context_accessor

    def execute(self, dto: CreateRouteRequestDTO) -> RouteResponseDTO:
        tenant_ctx = self.context_accessor.tenant()
        if not tenant_ctx or not tenant_ctx.tenant_id:
            raise ValueError("Tenant context is required")
            
        route = Route.create(
            tenant_id=tenant_ctx.tenant_id,
            execution_date=dto.execution_date
        )
        
        if dto.estimated_volume is not None:
            route.estimated_volume = dto.estimated_volume
        if dto.estimated_weight is not None:
            route.estimated_weight = dto.estimated_weight
        if dto.planned_distance is not None:
            route.planned_distance = dto.planned_distance
        if dto.planned_duration is not None:
            route.planned_duration = dto.planned_duration
        
        with self.uow.begin():
            self.routing_repository.save(route)
            self.uow.collect_events(route)
            self.uow.commit()
            
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
            stops=[]
        )
