import uuid
from datetime import date

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.core.context import ContextAccessor
from modules.logistics.domain.value_objects.status import ServiceOrderStatus
from modules.logistics.infrastructure.orm_models import ORMServiceOrder
from modules.routing.application.dto import (
    AssignRouteResourcesRequestDTO,
    CreateRouteRequestDTO,
)
from modules.routing.application.use_cases.assign_route_resources import (
    AssignRouteResourcesUseCase,
)
from modules.routing.application.use_cases.create_route import CreateRouteUseCase
from modules.routing.infrastructure.repositories.sqlalchemy_routing_repository import (
    SQLAlchemyRoutingRepository,
)
from modules.fleet.infrastructure.repositories.sqlalchemy_fleet_repository import (
    SQLAlchemyFleetRepository,
)


class DispatchOrdersRequestDTO(BaseModel):
    service_order_ids: list[uuid.UUID]
    execution_date: date
    vehicle_id: uuid.UUID | None = None
    driver_id: uuid.UUID | None = None


class DispatchOrdersUseCase:
    def __init__(self, session: AsyncSession, context_accessor: ContextAccessor):
        self.session = session
        self.context_accessor = context_accessor

    async def execute(self, request: DispatchOrdersRequestDTO) -> uuid.UUID:
        tenant_ctx = self.context_accessor.tenant()
        if not tenant_ctx or not tenant_ctx.tenant_id:
            raise ValueError("Tenant context is required")

        if not request.service_order_ids:
            raise ValueError("No service orders provided for dispatch")

        # 1. Fetch pending ServiceOrders
        stmt = (
            select(ORMServiceOrder)
            .where(ORMServiceOrder.id.in_(request.service_order_ids))
            .where(ORMServiceOrder.tenant_id == tenant_ctx.tenant_id)
            .options(selectinload(ORMServiceOrder.items))
        )
        result = await self.session.execute(stmt)
        service_orders = result.scalars().all()

        if len(service_orders) != len(request.service_order_ids):
            raise ValueError("One or more service orders not found or do not belong to the tenant")

        for order in service_orders:
            if order.status not in (ServiceOrderStatus.PENDING, ServiceOrderStatus.SCHEDULED):
                raise ValueError(f"Service Order {order.id} cannot be dispatched because it is in {order.status.value} status")

        # 2. Create the Route using the Routing Module
        routing_repo = SQLAlchemyRoutingRepository(self.session)
        create_route_use_case = CreateRouteUseCase(
            session=self.session,
            routing_repository=routing_repo,
            context_accessor=self.context_accessor,
        )

        create_dto = CreateRouteRequestDTO(
            execution_date=request.execution_date
        )
        
        route_response = await create_route_use_case.execute(create_dto)
        route_id = route_response.id

        # 3. Assign Vehicle/Driver if provided
        if request.vehicle_id and request.driver_id:
            fleet_repo = SQLAlchemyFleetRepository(self.session)
            assign_use_case = AssignRouteResourcesUseCase(
                session=self.session,
                routing_repository=routing_repo,
                fleet_repository=fleet_repo,
                context_accessor=self.context_accessor,
            )
            assign_dto = AssignRouteResourcesRequestDTO(
                route_id=route_id,
                vehicle_id=request.vehicle_id,
                driver_id=request.driver_id,
            )
            await assign_use_case.execute(assign_dto)

        # 4. Update the ServiceOrders to SCHEDULED (ROUTED) and assign the route
        for order in service_orders:
            from modules.logistics.domain.entities.service_order import ServiceOrder
            
            # Map ORM to Domain to use domain logic
            domain_order = ServiceOrder(
                id=order.id,
                tenant_id=order.tenant_id,
                service_plan_id=order.service_plan_id,
                company_id=order.company_id,
                scheduled_date=order.scheduled_date,
                status=order.status,
                workflow_type=order.workflow_type,
                vehicle_id=order.vehicle_id,
                driver_id=order.driver_id,
                route_id=order.route_id,
                destination_id=order.destination_id,
                completed_at=order.completed_at,
                created_at=order.created_at,
                updated_at=order.updated_at
            )
            
            domain_order.mark_as_scheduled(
                route_id=route_id,
                vehicle_id=request.vehicle_id,
                driver_id=request.driver_id
            )
            
            # Map Domain back to ORM
            order.status = domain_order.status
            order.route_id = domain_order.route_id
            order.vehicle_id = domain_order.vehicle_id
            order.driver_id = domain_order.driver_id
            order.updated_at = domain_order.updated_at

        await self.session.commit()
        return route_id
