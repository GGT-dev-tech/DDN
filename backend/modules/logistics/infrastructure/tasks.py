import asyncio
from datetime import UTC, datetime

from database.session import async_session_maker
from modules.logistics.application.generate_orders_service import GenerateDailyOrdersService
from modules.logistics.infrastructure.repositories.sql_service_order_repository import SqlServiceOrderRepository

from apps.api_gateway.src.worker import celery_app

@celery_app.task(name="logistics.generate_daily_service_orders")
def generate_daily_service_orders_task():
    """
    Celery task that runs daily to generate service orders for the current date.
    """
    async def run_async():
        async with async_session_maker() as session:
            repo = SqlServiceOrderRepository(session)
            service = GenerateDailyOrdersService(session, repo)
            today = datetime.now(UTC).date()
            
            count = await service.execute(today)
            await session.commit()
            return count

    # Run the async loop synchronously
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    count = loop.run_until_complete(run_async())
    return f"Generated {count} service orders for today."
