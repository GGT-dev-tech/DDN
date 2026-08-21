import uuid
from datetime import date, datetime

import uuid6
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database.core.base import Base, TenantScopedEntity
from modules.catalog.domain.entities.service_attribute import AttributeType
from modules.catalog.domain.entities.service_offering import ServiceStatus
from modules.catalog.domain.entities.unit_of_measure import UOMBaseType


class CatalogUnitOfMeasure(Base):
    __tablename__ = "catalog_units_of_measure"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    symbol: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base_type: Mapped[UOMBaseType] = mapped_column(Enum(UOMBaseType, name="catalog_uom_base_type", native_enum=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CatalogServiceAttribute(TenantScopedEntity):
    __tablename__ = "catalog_service_attributes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    attribute_type: Mapped[AttributeType] = mapped_column(Enum(AttributeType, name="catalog_attribute_type", native_enum=False), nullable=False)
    possible_values: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CatalogServiceOffering(TenantScopedEntity):
    __tablename__ = "catalog_service_offerings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[ServiceStatus] = mapped_column(Enum(ServiceStatus, name="catalog_service_status", native_enum=False), nullable=False)
    default_uom_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("catalog_units_of_measure.id"), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    attributes: Mapped[list["CatalogServiceOfferingAttribute"]] = relationship("CatalogServiceOfferingAttribute", back_populates="service_offering", cascade="all, delete-orphan")
    default_uom: Mapped["CatalogUnitOfMeasure"] = relationship("CatalogUnitOfMeasure")

class CatalogServiceOfferingAttribute(TenantScopedEntity):
    __tablename__ = "catalog_service_offering_attributes"

    # We make this tenant-scoped by inheriting TenantScopedEntity, 
    # but the primary keys are the two FKs forming a composite key,
    # OR we can just give it a UUID PK. Using UUID PK is easier with SQLAlchemy ORM.
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    service_offering_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("catalog_service_offerings.id"), nullable=False)
    service_attribute_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("catalog_service_attributes.id"), nullable=False)
    allowed_values: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    service_offering: Mapped["CatalogServiceOffering"] = relationship("CatalogServiceOffering", back_populates="attributes")
    service_attribute: Mapped["CatalogServiceAttribute"] = relationship("CatalogServiceAttribute")
