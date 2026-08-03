from celery import Celery
from src.config.settings import settings

celery_app = Celery(
    "ddn_worker",
    broker=settings.broker_url,
    backend=settings.redis_url,
    include=["src.tasks.outbox_processor", "src.tasks.scheduler_processor"],
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

# Optional: Beat schedule for background recurring tasks
celery_app.conf.beat_schedule = {
    'process-outbox-every-2-seconds': {
        'task': 'src.tasks.outbox_processor.process_outbox',
        'schedule': 2.0,
    },
    'generate-daily-orders-at-midnight': {
        'task': 'src.tasks.scheduler_processor.generate_daily_orders',
        # Em produção, usaria crontab(minute=0, hour=0)
        # Para fins de demonstração, roda a cada 1 hora ou apenas quando forçado
        'schedule': 3600.0,
    },
}
