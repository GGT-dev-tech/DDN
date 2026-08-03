import uuid
from decimal import Decimal

from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.core.base import Base

class ORMInvoice(Base):
    __tablename__ = "billing_invoices"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    reference_month = Column(String(7), nullable=False)
    status = Column(String(20), nullable=False, default="DRAFT")
    issue_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)
    
    items = relationship("ORMInvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class ORMInvoiceItem(Base):
    __tablename__ = "billing_invoice_items"

    id = Column(UUID(as_uuid=True), primary_key=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("billing_invoices.id"), nullable=False)
    service_offering_id = Column(UUID(as_uuid=True), nullable=False)
    service_name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    service_order_id = Column(UUID(as_uuid=True), nullable=True)
    
    invoice = relationship("ORMInvoice", back_populates="items")
