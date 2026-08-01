import os
from celery import Celery

# Set default settings module if not provided
os.environ.setdefault("ENVIRONMENT", "development")

celery_app = Celery("ddn_management")

celery_app.conf.update(
    broker_url=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    result_backend=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=4,
    worker_prefetch_multiplier=1,
)

# Auto-discover tasks in modules
celery_app.autodiscover_tasks([
    "modules.routing.infrastructure.tasks",
    "modules.logistics.infrastructure.tasks",
])
