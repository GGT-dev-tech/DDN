from datetime import date
from uuid import UUID as PyUUID

from sqlalchemy import Date, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7

from database.core.base import Base
from modules.routing.domain.entities.route import RouteStatus, StopStatus
from modules.routing.domain.value_objects import RequirementStatus

class CollectionRequirementModel(Base):
    __tablename__ = "routing_collection_requirements"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid7)
    tenant_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Generic references for UPSERT idempotency
    origin_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    origin_item_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Flattened Location
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    location_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Flattened Recurrence as JSONB, or we can use JSONB for recurrence since it has many subfields (frequency, weekdays array, time).
    # Since SQLAlchemy 2.0 doesn't have an easy JSONB Mapped type out of the box without Any, let's just use mapped_column with JSONB.
    from sqlalchemy.dialects.postgresql import JSONB
    recurrence: Mapped[dict] = mapped_column(JSONB, nullable=False)
    
    from sqlalchemy import Numeric
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit_of_measure: Mapped[str] = mapped_column(String(50), nullable=False)
    
    status: Mapped[RequirementStatus] = mapped_column(Enum(RequirementStatus), default=RequirementStatus.ACTIVE, nullable=False)
    
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    
    from sqlalchemy import UniqueConstraint
    __table_args__ = (
        UniqueConstraint('tenant_id', 'origin_reference', 'origin_item_id', name='uq_requirement_origin'),
    )


class RouteModel(Base):
    __tablename__ = "routing_routes"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid7)
    tenant_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    execution_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[RouteStatus] = mapped_column(Enum(RouteStatus), default=RouteStatus.DRAFT, nullable=False)
    
    estimated_volume: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    planned_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    planned_duration: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    vehicle_id: Mapped[PyUUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    driver_id: Mapped[PyUUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    
    stops: Mapped[list["StopModel"]] = relationship(
        "StopModel", 
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="StopModel.order"
    )

class StopModel(Base):
    __tablename__ = "routing_stops"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid7)
    route_id: Mapped[PyUUID] = mapped_column(ForeignKey("routing_routes.id", ondelete="CASCADE"), nullable=False)
    
    # Location value object flattened
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[StopStatus] = mapped_column(Enum(StopStatus), default=StopStatus.SCHEDULED, nullable=False)
    
    route: Mapped["RouteModel"] = relationship("RouteModel", back_populates="stops")
