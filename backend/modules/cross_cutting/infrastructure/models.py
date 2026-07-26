import uuid
from datetime import datetime

import uuid6
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database.core.base import TenantScopedEntity


class CrossCuttingTag(TenantScopedEntity):
    __tablename__ = "cross_cutting_tags"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class CrossCuttingTagging(TenantScopedEntity):
    __tablename__ = "cross_cutting_taggings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    tag_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cross_cutting_tags.id"), nullable=False)
    aggregate_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'commercial_lead'
    aggregate_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tag: Mapped["CrossCuttingTag"] = relationship("CrossCuttingTag")

class CrossCuttingActivity(TenantScopedEntity):
    __tablename__ = "cross_cutting_activities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # 'note', 'email', 'call', 'system'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True) # user_id
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class CrossCuttingActivityRelation(TenantScopedEntity):
    __tablename__ = "cross_cutting_activity_relations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    activity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("cross_cutting_activities.id", ondelete="CASCADE"), nullable=False)
    aggregate_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'commercial_lead'
    aggregate_id: Mapped[uuid.UUID] = mapped_column(nullable=False)

    activity: Mapped["CrossCuttingActivity"] = relationship("CrossCuttingActivity")
