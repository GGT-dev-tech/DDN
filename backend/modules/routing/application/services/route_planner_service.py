import logging
from datetime import date
from decimal import Decimal
from typing import Protocol

from modules.core.domain.id_generator import IdGenerator
from modules.routing.domain.entities.collection_requirement import CollectionRequirement
from modules.routing.domain.entities.route import Route, RouteStatus, Stop
from modules.routing.domain.value_objects import Frequency

logger = logging.getLogger(__name__)

class RouteRepository(Protocol):
    async def save(self, route: Route) -> None:
        pass


class RequirementRepository(Protocol):
    async def list_active_requirements(self, tenant_id) -> list[CollectionRequirement]:
        pass


class RoutePlannerService:
    """
    Worker service that reads CollectionRequirements and generates Routes and Stops
    for a given execution_date.
    
    This is usually executed by a Cron job at D+1 (or for a rolling week).
    """

    def __init__(self, requirement_repo: RequirementRepository, route_repo: RouteRepository):
        self.requirement_repo = requirement_repo
        self.route_repo = route_repo

    async def plan_daily_routes(self, tenant_id, execution_date: date) -> list[Route]:
        logger.info(f"Planning routes for tenant {tenant_id} on {execution_date}")
        
        # 1. Fetch active requirements
        requirements = await self.requirement_repo.list_active_requirements(tenant_id)
        
        # 2. Filter requirements that should be collected on this execution_date
        valid_reqs = []
        for req in requirements:
            if self._is_scheduled_for_date(req, execution_date):
                valid_reqs.append(req)

        if not valid_reqs:
            logger.info("No requirements for this date.")
            return []

        # 3. Simple allocation strategy: One Route per 1000 units, just for demonstration
        # In a real scenario, this would use a TSP/VRP solver or OR-Tools.
        
        routes: list[Route] = []
        current_route = self._create_empty_route(tenant_id, execution_date)
        current_capacity = Decimal("0")
        MAX_CAPACITY = Decimal("1000") # arbitrary for example
        
        for req in valid_reqs:
            # Check capacity
            if current_capacity + req.quantity > MAX_CAPACITY and len(current_route.stops) > 0:
                routes.append(current_route)
                current_route = self._create_empty_route(tenant_id, execution_date)
                current_capacity = Decimal("0")
                
            # Add stop
            stop = Stop(
                id=IdGenerator.generate(),
                location=req.location,
                order=len(current_route.stops) + 1,
            )
            current_route.stops.append(stop)
            current_capacity += req.quantity
            
            # Here we could also sum estimated_volume/weight if we had unit_of_measure conversion
        
        if len(current_route.stops) > 0:
            routes.append(current_route)

        # 4. Save routes
        for r in routes:
            await self.route_repo.save(r)
            
        logger.info(f"Planned {len(routes)} routes for {execution_date}.")
        return routes

    def _is_scheduled_for_date(self, req: CollectionRequirement, target_date: date) -> bool:
        """
        Evaluate recurrence rule to see if it lands on target_date.
        """
        rec = req.recurrence
        
        # Check weekday
        # Python weekday(): Monday=0, Sunday=6
        target_weekday = target_date.weekday()
        scheduled_weekdays = [w.value for w in rec.weekdays]
        
        if target_weekday not in scheduled_weekdays:
            return False
            
        if rec.frequency == Frequency.DAILY:
            # If frequency is daily and weekday matches, it's valid
            # (interval applies to days)
            pass
        elif rec.frequency == Frequency.WEEKLY:
            # Should check interval vs start date
            pass
        elif rec.frequency == Frequency.MONTHLY:
            # Should check interval vs start date
            pass
            
        # For simplicity of this demonstration, if the weekday matches, we say yes.
        # A full implementation requires tracking the base date to calculate intervals.
        return True

    def _create_empty_route(self, tenant_id, execution_date: date) -> Route:
        return Route(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            execution_date=execution_date,
            status=RouteStatus.DRAFT,
            stops=[]
        )
