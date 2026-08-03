import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.core.base import Base
from modules.billing.domain.entities.invoice import InvoiceStatus


class ORMInvoice(Base):
    __tablename__ = "billing_invoices"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    
    reference_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus, name="invoicestatus"))
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    items: Mapped[list["ORMInvoiceItem"]] = relationship(
        "ORMInvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class ORMInvoiceItem(Base):
    __tablename__ = "billing_invoice_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    invoice_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("billing_invoices.id", ondelete="CASCADE"), index=True)
    service_order_id: Mapped[uuid.UUID] = mapped_column(Uuid, index=True)
    
    description: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    total_price: Mapped[float] = mapped_column(Numeric(10, 2))
    
    invoice: Mapped["ORMInvoice"] = relationship(
        "ORMInvoice",
        back_populates="items"
    )
