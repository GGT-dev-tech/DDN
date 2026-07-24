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
    aggregate_name: Mapped[str] = mapped_column(index=True)
    aggregate_id: Mapped[str] = mapped_column()
    event_type: Mapped[str] = mapped_column()
    payload: Mapped[dict] = mapped_column(type_=JSONB)
    metadata_json: Mapped[dict] = mapped_column(type_=JSONB, default=dict)
    
    status: Mapped[str] = mapped_column(default="PENDING", index=True) # PENDING, PROCESSED, FAILED
    retry_count: Mapped[int] = mapped_column(default=0)
    error_message: Mapped[str | None] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    processed_at: Mapped[datetime | None] = mapped_column(nullable=True)
