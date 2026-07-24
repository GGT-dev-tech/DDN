import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class AppSettings(BaseSettings):
    """
    Core application settings loaded from environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    api_port: int = Field(default=8000, validation_alias="API_PORT")
    secret_key: str = Field(default="super-secret-key-change-me", validation_alias="SECRET_KEY")

class DatabaseSettings(BaseSettings):
    """
    Database settings.
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    host: str = Field(validation_alias="DATABASE_HOST")
    port: int = Field(default=5432, validation_alias="DATABASE_PORT")
    user: str = Field(validation_alias="DATABASE_USER")
    password: str = Field(validation_alias="DATABASE_PASSWORD")
    name: str = Field(validation_alias="DATABASE_NAME")
    
    migration_user: str | None = Field(default=None, validation_alias="DATABASE_MIGRATION_USER")
    migration_password: str | None = Field(default=None, validation_alias="DATABASE_MIGRATION_PASSWORD")

    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def migration_url(self) -> str:
        m_user = self.migration_user or self.user
        m_pass = self.migration_password or self.password
        return f"postgresql://{m_user}:{m_pass}@{self.host}:{self.port}/{self.name}"

class RedisSettings(BaseSettings):
    """
    Redis settings.
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    host: str = Field(validation_alias="REDIS_HOST")
    port: int = Field(default=6379, validation_alias="REDIS_PORT")

class Settings:
    """
    Global settings object aggregating all settings.
    """
    app = AppSettings()
    db = DatabaseSettings()
    redis = RedisSettings()

# Singleton instance
settings = Settings()
