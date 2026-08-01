import asyncio
import logging
import uuid
from datetime import date
from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.session import async_session_maker
from modules.routing.domain.entities.collection_requirement import CollectionRequirement
from modules.fleet.infrastructure.orm_models import VehicleModel
from modules.routing.domain.entities.route import Route
from modules.routing.infrastructure.repositories.sqlalchemy_routing_repository import SQLAlchemyRoutingRepository

logger = logging.getLogger(__name__)

async def _optimize_routes_async(tenant_id_str: str, target_date_str: str):
    tenant_id = uuid.UUID(tenant_id_str)
    target_date = date.fromisoformat(target_date_str)
    
    logger.info(f"Starting route optimization for tenant {tenant_id} on {target_date}")
    
    async with async_session_maker() as session:
        # 1. Fetch available vehicles
        # (Assuming all active vehicles for simplicity right now)
        vehicles_result = await session.execute(
            select(VehicleModel).where(
                VehicleModel.tenant_id == tenant_id,
                VehicleModel.status == 'ACTIVE'
            )
        )
        vehicles = vehicles_result.scalars().all()
        
        if not vehicles:
            logger.warning("No available vehicles found for routing.")
            return {"status": "failed", "reason": "No available vehicles"}
            
        # 2. Fetch pending requirements
        reqs_result = await session.execute(
            select(CollectionRequirement).where(
                CollectionRequirement.tenant_id == tenant_id,
                CollectionRequirement.status == 'PENDING'
            )
        )
        requirements = reqs_result.scalars().all()
        
        if not requirements:
            logger.info("No pending requirements to route.")
            return {"status": "success", "routes_created": 0}
            
        repo = SQLAlchemyRoutingRepository(session)
        
        # 3. Simple Greedy Routing Algorithm
        # In a real VRP, this would use OR-Tools or similar.
        # Here we just assign requirements to vehicles sequentially until full.
        routes_created = []
        current_vehicle_idx = 0
        
        # Create initial route for first vehicle
        current_route = Route.create(tenant_id, target_date)
        current_route.vehicle_id = vehicles[current_vehicle_idx].id
        await repo.save(current_route)
        
        for req in requirements:
            # Add stop to current route
            # In a real app we'd check coordinates, volume/weight limits, etc.
            current_route.add_stop(req)
            req.mark_as_routed(current_route.id)
            session.add(req)
            
            # If route gets too big (e.g. 5 stops), create next one
            if len(current_route.stops) >= 5:
                routes_created.append(current_route)
                
                # Move to next vehicle if available
                if current_vehicle_idx + 1 < len(vehicles):
                    current_vehicle_idx += 1
                    current_route = Route.create(tenant_id, target_date)
                    current_route.vehicle_id = vehicles[current_vehicle_idx].id
                    await repo.save(current_route)
                else:
                    logger.warning("Ran out of vehicles before routing all requirements.")
                    break
        
        if current_route not in routes_created and len(current_route.stops) > 0:
            routes_created.append(current_route)
            
        await session.commit()
        
        logger.info(f"Successfully generated {len(routes_created)} routes.")
        return {"status": "success", "routes_created": len(routes_created)}

@shared_task
def optimize_routes_task(tenant_id_str: str, target_date_str: str):
    """
    Celery task that triggers the async VRP routing optimization.
    """
    return asyncio.run(_optimize_routes_async(tenant_id_str, target_date_str))
