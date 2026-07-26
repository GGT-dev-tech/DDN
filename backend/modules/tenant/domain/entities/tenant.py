import enum
from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7

from database.core.base import Base, utcnow
from modules.core.domain.aggregate import AggregateRoot


class TenantStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    CANCELLED = "CANCELLED"

class TenantPlan(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class Tenant(Base, AggregateRoot):
    __tablename__ = "tenants"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(50), nullable=True, unique=True, index=True)
    
    status: Mapped[TenantStatus] = mapped_column(Enum(TenantStatus), default=TenantStatus.ACTIVE, nullable=False)
    plan: Mapped[TenantPlan] = mapped_column(Enum(TenantPlan), default=TenantPlan.FREE, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
