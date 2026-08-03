"""
Service Plan — ORM Models.

Design decisions:
- CollectionPoint and Recurrence are stored as JSONB (they are Value Objects — no identity).
- version column enables optimistic locking in the repository.
- Both tables have tenant_id for RLS policy enforcement.
- ServiceScheduleModel has NO standalone repository. Access is always via ServicePlanModel.
"""
import uuid
from typing import Any

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from database.core.base import Base
from modules.service_plan.domain.value_objects import ScheduleStatus, ServicePlanStatus


class ServicePlanModel(Base):
    __tablename__ = "service_plan_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(Integer, nullable=False, default=1)          # optimistic locking
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    contract_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    status: Any = Column(  # type: ignore[assignment]
        SQLEnum(ServicePlanStatus, name="serviceplanstatus"),
        nullable=False,
        default=ServicePlanStatus.DRAFT,
    )

    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    schedules = relationship(
        "ServiceScheduleModel",
        back_populates="plan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ServiceScheduleModel(Base):
    """
    Internal entity — no repository of its own (D6).
    Always loaded as part of ServicePlanModel via selectin loading.
    """
    __tablename__ = "service_plan_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("service_plan_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_offering_id = Column(UUID(as_uuid=True), nullable=False)
    service_name = Column(String(255), nullable=False)            # immutable snapshot
    quantity_snapshot = Column(Numeric(10, 2), nullable=False, server_default="0")  # immutable snapshot
    collection_point = Column(JSONB, nullable=True)               # None until filled

    recurrence = Column(JSONB, nullable=True)                     # None until filled
    status: Any = Column(  # type: ignore[assignment]
        SQLEnum(ScheduleStatus, name="schedulestatus"),
        nullable=False,
        default=ScheduleStatus.ACTIVE,
    )

    notes = Column(Text, nullable=True)

    plan = relationship("ServicePlanModel", back_populates="schedules")
