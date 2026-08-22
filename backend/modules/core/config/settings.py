from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from .database import DatabaseSettings
from .security import SecuritySettings


class AppSettings(BaseSettings):
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    api_port: int = Field(default=8000, validation_alias="API_PORT")
    google_maps_api_key: str | None = Field(default=None, validation_alias="GOOGLE_MAPS_API_KEY")

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore"
    )

class Settings:
    app = AppSettings()
    db = DatabaseSettings()
    security = SecuritySettings()

settings = Settings()
