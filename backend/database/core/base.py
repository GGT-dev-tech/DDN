from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Any
from sqlalchemy import UUID, text

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    
    # Common columns could be added here, though we prefer explicitness on entities.
    pass

class TenantScopedEntity(Base):
    """
    Base class for all entities that belong to a specific tenant.
    It automatically adds the tenant_id column.
    Alembic migrations can look for `__rls_enabled__` to generate RLS policies.
    """
    __abstract__ = True
    __rls_enabled__ = True

    tenant_id: Mapped[uuid.UUID] = mapped_column(index=True, nullable=False)

def utcnow() -> datetime:
    """Helper to get timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)
