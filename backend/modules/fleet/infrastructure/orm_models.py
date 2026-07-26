from uuid import UUID as PyUUID

from sqlalchemy import Enum, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7

from database.core.base import Base
from modules.fleet.domain.entities.driver import DriverStatus
from modules.fleet.domain.entities.vehicle import VehicleStatus, VehicleType


class VehicleModel(Base):
    __tablename__ = "fleet_vehicles"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid7)
    tenant_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    license_plate: Mapped[str] = mapped_column(String(50), nullable=False)
    vehicle_type: Mapped[VehicleType] = mapped_column(Enum(VehicleType), nullable=False)
    capacity_volume: Mapped[float] = mapped_column(Float, nullable=False)
    capacity_weight: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[VehicleStatus] = mapped_column(Enum(VehicleStatus), nullable=False, default=VehicleStatus.ACTIVE)

class DriverModel(Base):
    __tablename__ = "fleet_drivers"

    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid7)
    tenant_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus), nullable=False, default=DriverStatus.AVAILABLE)
