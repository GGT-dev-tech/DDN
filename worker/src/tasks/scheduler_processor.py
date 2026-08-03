import asyncio
import logging
from datetime import date, timedelta
from typing import Optional

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.session import async_session_maker
from modules.service_plan.infrastructure.orm_models import ORMServicePlan
from modules.logistics.infrastructure.orm_models import ORMServiceOrder, ORMServiceOrderItem

logger = logging.getLogger(__name__)

async def _generate_daily_orders():
    """
    Async logic to find active service plans and generate orders for today.
    In a real-world scenario, this would check specific days of week or frequency.
    For MVP, we generate an order for active plans if one doesn't exist for today.
    """
    today = date.today()
    
    async with async_session_maker() as session:
        # Find all active plans
        stmt = select(ORMServicePlan).where(ORMServicePlan.status == "ACTIVE").options(selectinload(ORMServicePlan.items))
        result = await session.execute(stmt)
        plans = result.scalars().all()
        
        created_count = 0
        for plan in plans:
            # Check if an order already exists for this plan today
            order_stmt = select(ORMServiceOrder).where(
                ORMServiceOrder.tenant_id == plan.tenant_id,
                ORMServiceOrder.company_id == plan.company_id,
                ORMServiceOrder.scheduled_date == today
            )
            order_result = await session.execute(order_stmt)
            existing_order = order_result.scalar_one_or_none()
            
            if not existing_order:
                # Create a new Service Order
                import uuid
                order_id = uuid.uuid4()
                new_order = ORMServiceOrder(
                    id=order_id,
                    tenant_id=plan.tenant_id,
                    company_id=plan.company_id,
                    scheduled_date=today,
                    status="SCHEDULED",
                )
                
                # Add items from plan
                for plan_item in plan.items:
                    order_item = ORMServiceOrderItem(
                        id=uuid.uuid4(),
                        service_order_id=order_id,
                        service_name=plan_item.service_name,
                        quantity=plan_item.quantity,
                    )
                    new_order.items.append(order_item)
                
                session.add(new_order)
                created_count += 1
                
        if created_count > 0:
            await session.commit()
            
        return created_count

@shared_task(name="src.tasks.scheduler_processor.generate_daily_orders")
def generate_daily_orders():
    """
    Celery task that triggers the daily generation of service orders.
    Designed to run once a day (e.g. at midnight or 1 AM).
    """
    logger.info("Starting generation of daily service orders...")
    try:
        # Run async function in sync wrapper
        count = asyncio.run(_generate_daily_orders())
        logger.info(f"Successfully generated {count} service orders for today.")
        return {"status": "success", "orders_created": count}
    except Exception as e:
        logger.error(f"Error generating service orders: {e}")
        return {"status": "error", "message": str(e)}
