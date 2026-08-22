import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from modules.logistics.infrastructure.tasks import generate_daily_service_orders_task

# Initialize the scheduler
scheduler = AsyncIOScheduler()

def start_scheduler():
    """
    Start the APScheduler for the logistics module.
    """
    # Run the generate_daily_service_orders_task every day at 01:00 AM
    scheduler.add_job(
        generate_daily_service_orders_task,
        CronTrigger(hour=1, minute=0),
        id="generate_daily_service_orders",
        replace_existing=True
    )
    
    scheduler.start()
    print("APScheduler started: generate_daily_service_orders scheduled for 01:00 AM daily.")

def shutdown_scheduler():
    scheduler.shutdown()
