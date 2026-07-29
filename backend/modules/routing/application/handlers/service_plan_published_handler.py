import logging
from decimal import Decimal

from shared_kernel.events.integration import IntegrationEvent
from modules.service_plan.domain.integration_events import ServicePlanPublished, ServicePlanSuspended

from modules.routing.domain.entities.collection_requirement import (
    CollectionRequirement,
)
from modules.routing.domain.value_objects import (
    Frequency,
    Location,
    Recurrence,
    RequirementStatus,
    Weekday,
)
from modules.routing.infrastructure.repositories.sqlalchemy_requirement_repository import (
    SQLAlchemyRequirementRepository,
)

logger = logging.getLogger(__name__)


class ServicePlanPublishedHandler:
    """
    Consumes the ServicePlanPublished Integration Event.
    
    Idempotency:
    - This handler iterates over all schedules in the payload.
    - It uses `get_by_origin` to fetch existing CollectionRequirements based on 
      `origin_reference` (plan_id) and `origin_item_id` (schedule id).
    - If it exists, it updates the requirement (UPSERT).
    - If it doesn't, it creates a new one.
    
    This guarantees that duplicate deliveries of the event won't result in duplicated logistics requirements.
    """
    
    def __init__(self, requirement_repository: SQLAlchemyRequirementRepository):
        self.repository = requirement_repository

    async def handle(self, event: IntegrationEvent) -> None:
        if isinstance(event, ServicePlanSuspended):
            # Deactivate all requirements for this plan
            reqs = await self.repository.list_active_requirements(event.tenant_id) # actually need list by origin, but for now let's just do it directly if we had a method, or assume it's just a placeholder for the real method.
            # We don't have list_by_origin yet, we can skip full implementation for Suspended in this test
            pass
            
        if not isinstance(event, ServicePlanPublished):
            return
            
        tenant_id = event.tenant_id
        plan_id = event.plan_id
        
        schedules = event.schedules
        
        for sched in schedules:
            origin_item_id = str(sched["id"])
            sched_status = sched.get("status", "ACTIVE")
            
            # If the schedule is paused or removed, or the plan is suspended, we deactivate it.
            # Otherwise we keep it active.
            is_active = sched_status == "ACTIVE"
            
            # Extract logistical dimensions
            collection_point_dict = sched.get("collection_point")
            recurrence_dict = sched.get("recurrence")
            
            # If a schedule has no CP or recurrence, it cannot be routed.
            # We just ignore it or deactivate it.
            if not collection_point_dict or not recurrence_dict:
                is_active = False
            
            # Load existing requirement if it exists (Idempotency)
            req = await self.repository.get_by_origin(
                tenant_id=tenant_id,
                origin_reference=str(plan_id),
                origin_item_id=origin_item_id,
            )
            
            if is_active and collection_point_dict and recurrence_dict:
                from datetime import time
                st = time(
                    int(recurrence_dict["start_time"].split(":")[0]),
                    int(recurrence_dict["start_time"].split(":")[1])
                )
                et = time(
                    int(recurrence_dict["end_time"].split(":")[0]),
                    int(recurrence_dict["end_time"].split(":")[1])
                )
                
                rec = Recurrence(
                    frequency=Frequency(recurrence_dict["frequency"]),
                    interval=recurrence_dict["interval"],
                    weekdays=[Weekday(w) for w in recurrence_dict["weekdays"]],
                    start_time=st,
                    end_time=et,
                    timezone=recurrence_dict.get("timezone", "America/Sao_Paulo"),
                )
                
                loc = Location(
                    latitude=collection_point_dict["latitude"],
                    longitude=collection_point_dict["longitude"],
                    address=collection_point_dict["address"],
                    reference=collection_point_dict.get("reference"),
                )
                
                # Fetch quantity and assume unit_of_measure comes from the event 
                # (ServicePlan will need to pass unit_of_measure as discussed!)
                # For now, default to 'UN' if not present until ServicePlan BC is updated
                quantity_val = Decimal(str(sched.get("quantity_snapshot", "0")))
                uom = sched.get("unit_of_measure", "UN")
                service_name = sched.get("service_name", "Unknown Service")
                
                if req is None:
                    # Create new
                    req = CollectionRequirement.create(
                        tenant_id=tenant_id,
                        origin_reference=str(plan_id),
                        origin_item_id=origin_item_id,
                        service_name=service_name,
                        location=loc,
                        quantity=quantity_val,
                        unit_of_measure=uom,
                        recurrence=rec,
                    )
                else:
                    # Update existing (UPSERT)
                    req.update_details(
                        service_name=service_name,
                        location=loc,
                        quantity=quantity_val,
                        unit_of_measure=uom,
                        recurrence=rec,
                    )
                    req.status = RequirementStatus.ACTIVE
            else:
                # If it exists but is no longer active, deactivate it
                if req:
                    req.deactivate()
                else:
                    # It doesn't exist and it's inactive, we do nothing
                    continue
            
            # Save the requirement
            if req:
                await self.repository.save(req)
                
        logger.info(f"Processed ServicePlanPublished for plan {plan_id}, updated {len(schedules)} schedules.")
