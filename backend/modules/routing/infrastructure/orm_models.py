from sqlalchemy import String, Enum, DateTime, Date, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from uuid6 import uuid7
from uuid import UUID as PyUUID

from database.core.base import Base, utcnow
from modules.routing.domain.entities.route import RouteStatus, StopStatus

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
