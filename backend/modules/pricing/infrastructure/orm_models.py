from uuid import UUID
from datetime import date
from typing import Optional
from sqlalchemy import String, Date, Boolean, Numeric, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from database.core.base import Base

class PricingPriceTableModel(Base):
    __tablename__ = "pricing_price_tables"
    __table_args__ = {"extend_existing": True}

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    tenant_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    region_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    customer_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    items: Mapped[list["PricingPriceTableItemModel"]] = relationship(
        "PricingPriceTableItemModel",
        back_populates="price_table",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

class PricingPriceTableItemModel(Base):
    __tablename__ = "pricing_price_table_items"
    __table_args__ = {"extend_existing": True}

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    tenant_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, index=True)
    price_table_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("pricing_price_tables.id", ondelete="CASCADE"), nullable=False
    )
    service_offering_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    unit_of_measure_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    unit_price_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price_currency: Mapped[str] = mapped_column(String(3), nullable=False, default="BRL")
    
    price_table: Mapped["PricingPriceTableModel"] = relationship(
        "PricingPriceTableModel",
        back_populates="items"
    )

class PricingRuleModel(Base):
    __tablename__ = "pricing_rules"
    __table_args__ = {"extend_existing": True}

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    tenant_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    scope: Mapped[str] = mapped_column(String(50), nullable=False)  # PricingRuleScope
    rule_type: Mapped[str] = mapped_column(String(50), nullable=False)  # PricingRuleType
    value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Scope criteria
    customer_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    service_offering_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    region_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
