from pydantic_settings import BaseSettings, SettingsConfigDict

class WorkerSettings(BaseSettings):
    app_name: str = "DDN Management Worker"
    app_env: str = "development"
    redis_url: str = "redis://localhost:6379/0"
    broker_url: str = "redis://localhost:6379/0"
    database_url: str = "postgresql://stitch_admin:secret_postgres@localhost:5432/stitch_db"
    outbox_poll_interval: float = 1.5
    outbox_batch_size: int = 100

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = WorkerSettings()
