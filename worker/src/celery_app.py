from celery import Celery
from src.config.settings import settings

celery_app = Celery(
    "ddn_worker",
    broker=settings.broker_url,
    backend=settings.redis_url,
    include=["src.tasks.outbox_processor"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=4,
    worker_prefetch_multiplier=1,
)

# Optional: Beat schedule for background recurring tasks (like polling the outbox if done via beat)
celery_app.conf.beat_schedule = {
    'process-outbox-every-2-seconds': {
        'task': 'src.tasks.outbox_processor.process_outbox',
        'schedule': 2.0,
    },
}
