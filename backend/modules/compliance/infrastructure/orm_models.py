import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.core.base import Base
from modules.compliance.domain.value_objects.status import MTRStatus


class ORMWasteManifest(Base):
    __tablename__ = "compliance_waste_manifests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    generator_company_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    transporter_company_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    service_order_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    
    issue_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[MTRStatus] = mapped_column(Enum(MTRStatus, name="mtrstatus"))
    
    driver_name: Mapped[str] = mapped_column(String(255))
    vehicle_plate: Mapped[str] = mapped_column(String(20))
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    items: Mapped[list["ORMWasteItem"]] = relationship(
        "ORMWasteItem",
        back_populates="manifest",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class ORMWasteItem(Base):
    __tablename__ = "compliance_waste_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    manifest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("compliance_waste_manifests.id", ondelete="CASCADE"), index=True)
    
    waste_type: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[str] = mapped_column(String(50))
    un_code: Mapped[str] = mapped_column(String(50))
    
    manifest: Mapped["ORMWasteManifest"] = relationship(
        "ORMWasteManifest",
        back_populates="items"
    )
