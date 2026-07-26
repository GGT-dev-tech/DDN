
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    url: str = Field(validation_alias="DATABASE_URL", default="postgresql+asyncpg://stitch_admin:secret_postgres@localhost:5432/stitch_db")
    redis_url: str = Field(validation_alias="REDIS_URL", default="redis://localhost:6379/0")
    
    @property
    def migration_url(self) -> str:
        return self.url.replace("+asyncpg", "")

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore"
    )
