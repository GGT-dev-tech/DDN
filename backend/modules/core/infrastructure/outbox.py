import uuid
from uuid6 import uuid7
from datetime import datetime, UTC
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from database.core.base import Base

def utc_now():
    return datetime.now(UTC)

class OutboxEvent(Base):
    __tablename__ = "outbox_events"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    tenant_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True, index=True)
    
    aggregate_id: Mapped[str] = mapped_column(index=True)
    aggregate_type: Mapped[str] = mapped_column()
    
    event_name: Mapped[str] = mapped_column()
    
    payload: Mapped[dict] = mapped_column(type_=JSONB)
    headers: Mapped[dict] = mapped_column(type_=JSONB, default=dict)
    
    status: Mapped[str] = mapped_column(default="PENDING", index=True) # PENDING, PROCESSING, PROCESSED, FAILED, RETRYING, DEAD_LETTER, EXPIRED
    
    attempts: Mapped[int] = mapped_column(default=0)
    max_attempts: Mapped[int] = mapped_column(default=3)
    
    available_at: Mapped[datetime] = mapped_column(default=utc_now, index=True)
    processed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    locked_at: Mapped[datetime | None] = mapped_column(nullable=True)
    worker_id: Mapped[str | None] = mapped_column(nullable=True)
    
    correlation_id: Mapped[str] = mapped_column()
    causation_id: Mapped[str | None] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)
    
    error_message: Mapped[str | None] = mapped_column(nullable=True)
