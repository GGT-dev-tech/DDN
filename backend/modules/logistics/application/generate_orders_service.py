from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.logistics.domain.entities.service_order import ServiceOrder
from modules.logistics.domain.repositories.service_order_repository import ServiceOrderRepository
from modules.service_plan.domain.value_objects import ScheduleStatus, ServicePlanStatus
from modules.service_plan.infrastructure.orm_models import ServicePlanModel


class GenerateDailyOrdersService:
    def __init__(self, session: AsyncSession, service_order_repo: ServiceOrderRepository):
        self.session = session
        self.service_order_repo = service_order_repo

    async def execute(self, target_date: date) -> int:
        """
        Generates Service Orders for all active Service Plans that have schedules
        for the given target date (based on weekday).
        Returns the number of generated orders.
        """
        # Fetch active plans
        stmt = (
            select(ServicePlanModel)
            .where(ServicePlanModel.status == ServicePlanStatus.PUBLISHED)
            .options(selectinload(ServicePlanModel.schedules))
        )
        result = await self.session.execute(stmt)
        active_plans = result.scalars().all()
        
        target_weekday = target_date.strftime("%A").upper()  # MONDAY, TUESDAY, etc.
        
        generated_count = 0
        for plan_orm in active_plans:
            # Reconstruct domain logic or just check ORM here for simplicity
            # since we just need to see if it matches the weekday
            has_schedule_today = False
            items_to_collect = []
            
            for schedule_orm in plan_orm.schedules:
                if schedule_orm.status == ScheduleStatus.ACTIVE:
                    if schedule_orm.recurrence_weekdays:
                        if target_weekday in schedule_orm.recurrence_weekdays:
                            has_schedule_today = True
                            items_to_collect.append({
                                "service_offering_id": schedule_orm.service_offering_id,
                                "service_name": schedule_orm.service_name,
                                "quantity": schedule_orm.quantity_snapshot,
                            })
                            
            if has_schedule_today and items_to_collect:
                # Check if an order already exists for this plan on this date
                existing_orders = await self.service_order_repo.get_by_tenant_and_date(
                    tenant_id=plan_orm.tenant_id,
                    scheduled_date=target_date
                )
                
                already_generated = any(o.service_plan_id == plan_orm.id for o in existing_orders)
                
                if not already_generated:
                    # Generate new order
                    new_order = ServiceOrder.create(
                        tenant_id=plan_orm.tenant_id,
                        service_plan_id=plan_orm.id,
                        company_id=plan_orm.company_id,
                        scheduled_date=target_date,
                        items=items_to_collect
                    )
                    await self.service_order_repo.save(new_order)
                    generated_count += 1
                    
        return generated_count
