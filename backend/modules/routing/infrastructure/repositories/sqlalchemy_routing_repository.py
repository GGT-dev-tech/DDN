from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.routing.application.repositories import RoutingRepository
from modules.routing.domain.entities.route import Location, Route, Stop
from modules.routing.infrastructure.orm_models import RouteModel, StopModel


class SQLAlchemyRoutingRepository(RoutingRepository):
    def __init__(self, session: AsyncSession):
        self.session = session
        
    def _to_domain(self, model: RouteModel) -> Route:
        route = Route(
            id=model.id,
            tenant_id=model.tenant_id,
            execution_date=model.execution_date,
            estimated_volume=model.estimated_volume,
            estimated_weight=model.estimated_weight,
            planned_distance=model.planned_distance,
            planned_duration=model.planned_duration,
            vehicle_id=model.vehicle_id,
            driver_id=model.driver_id,
            stops=[
                Stop(
                    id=sm.id,
                    location=Location(latitude=sm.latitude, longitude=sm.longitude, address=sm.address),
                    order=sm.order,
                    status=sm.status
                ) for sm in model.stops
            ]
        )
        return route

    async def save(self, route: Route) -> None:
        stmt = select(RouteModel).options(selectinload(RouteModel.stops)).where(RouteModel.id == route.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            # Create new
            model = RouteModel(
                id=route.id,
                tenant_id=route.tenant_id,
                execution_date=route.execution_date,
                status=route.status,
                estimated_volume=route.estimated_volume,
                estimated_weight=route.estimated_weight,
                planned_distance=route.planned_distance,
                planned_duration=route.planned_duration,
                vehicle_id=route.vehicle_id,
                driver_id=route.driver_id
            )
            self.session.add(model)
        else:
            # Update existing
            model.status = route.status
            model.execution_date = route.execution_date
            model.estimated_volume = route.estimated_volume
            model.estimated_weight = route.estimated_weight
            model.planned_distance = route.planned_distance
            model.planned_duration = route.planned_duration
            model.vehicle_id = route.vehicle_id
            model.driver_id = route.driver_id
            
        # Handle stops syncing
        # Since stops are value-like inside the aggregate, we can synchronize them
        existing_stops = {sm.id: sm for sm in model.stops}
        current_stops = {s.id: s for s in route.stops}
        
        # Remove deleted stops
        for stop_id in list(existing_stops.keys()):
            if stop_id not in current_stops:
                await self.session.delete(existing_stops[stop_id])
                
        # Add or update stops
        for stop in route.stops:
            if stop.id not in existing_stops:
                new_stop_model = StopModel(
                    id=stop.id,
                    route_id=route.id,
                    latitude=stop.location.latitude,
                    longitude=stop.location.longitude,
                    address=stop.location.address,
                    order=stop.order,
                    status=stop.status
                )
                self.session.add(new_stop_model)
            else:
                existing_stop_model = existing_stops[stop.id]
                existing_stop_model.latitude = stop.location.latitude
                existing_stop_model.longitude = stop.location.longitude
                existing_stop_model.address = stop.location.address
                existing_stop_model.order = stop.order
                existing_stop_model.status = stop.status

    async def get_by_id(self, route_id: UUID) -> Route | None:
        stmt = select(RouteModel).options(selectinload(RouteModel.stops)).where(RouteModel.id == route_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return self._to_domain(model)

    async def list_routes(self, tenant_id: UUID) -> list[Route]:
        stmt = select(RouteModel).options(selectinload(RouteModel.stops)).where(RouteModel.tenant_id == tenant_id)
        result = await self.session.execute(stmt)
        models = result.scalars().unique().all()
        return [self._to_domain(m) for m in models]
