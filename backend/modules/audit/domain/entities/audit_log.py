from datetime import datetime
from uuid import UUID
from uuid6 import uuid7
from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database.core.base import Base, utcnow

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    tenant_id: Mapped[UUID | None] = mapped_column(ForeignKey("tenants.id", ondelete="SET NULL"), index=True, nullable=True)
    actor_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    session_id: Mapped[UUID | None] = mapped_column(nullable=True)
    
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    
    # Payload of the event (before/after states)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True, nullable=False)
