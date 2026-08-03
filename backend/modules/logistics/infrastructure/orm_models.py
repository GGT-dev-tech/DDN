import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.core.base import Base
from modules.logistics.domain.value_objects.status import (
    ServiceOrderStatus,
    ServiceOrderWorkflowType,
)


class ORMServiceOrder(Base):
    __tablename__ = "logistics_service_orders"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    service_plan_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    
    scheduled_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[ServiceOrderStatus] = mapped_column(Enum(ServiceOrderStatus, name="serviceorderstatus"))
    workflow_type: Mapped[ServiceOrderWorkflowType] = mapped_column(Enum(ServiceOrderWorkflowType, name="serviceorderworkflowtype"), server_default="WAREHOUSE_STORAGE")
    
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    driver_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    destination_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    items: Mapped[list["ORMServiceOrderItem"]] = relationship(
        "ORMServiceOrderItem",
        back_populates="service_order",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class ORMServiceOrderItem(Base):
    __tablename__ = "logistics_service_order_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    service_order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("logistics_service_orders.id", ondelete="CASCADE"), index=True)
    service_offering_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    
    quantity: Mapped[str] = mapped_column(String(50))
    service_name: Mapped[str] = mapped_column(String(255))
    
    service_order: Mapped["ORMServiceOrder"] = relationship(
        "ORMServiceOrder",
        back_populates="items"
    )
