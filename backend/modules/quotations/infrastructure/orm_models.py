from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.core.base import Base
from modules.quotations.domain.value_objects import QuotationStatus


class QuotationModel(Base):
    __tablename__ = "quotations_quotations"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    company_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    status = Column(SQLEnum(QuotationStatus, name="quotationstatus", create_type=False), nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    items = relationship("QuotationItemModel", back_populates="quotation", cascade="all, delete-orphan")


class QuotationItemModel(Base):
    __tablename__ = "quotations_quotation_items"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations_quotations.id"), nullable=False, index=True)
    service_offering_id = Column(UUID(as_uuid=True), nullable=False)
    unit_of_measure_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Numeric(15, 4), nullable=False)

    quotation = relationship("QuotationModel", back_populates="items")
    snapshot = relationship("QuotationItemSnapshotModel", back_populates="item", uselist=False, cascade="all, delete-orphan")


class QuotationItemSnapshotModel(Base):
    __tablename__ = "quotations_quotation_item_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    quotation_item_id = Column(UUID(as_uuid=True), ForeignKey("quotations_quotation_items.id"), nullable=False, index=True, unique=True)
    
    service_name = Column(String, nullable=False)
    unit_name = Column(String, nullable=False)
    
    base_unit_price = Column(Numeric(15, 4), nullable=False)
    total_base_price = Column(Numeric(15, 4), nullable=False)
    surcharges_total = Column(Numeric(15, 4), nullable=False)
    discounts_total = Column(Numeric(15, 4), nullable=False)
    final_price = Column(Numeric(15, 4), nullable=False)
    currency = Column(String, nullable=False)
    
    pricing_reference = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False)

    item = relationship("QuotationItemModel", back_populates="snapshot")
