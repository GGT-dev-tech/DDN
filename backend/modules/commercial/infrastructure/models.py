import uuid
from datetime import datetime

import uuid6
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database.core.base import TenantScopedEntity
from modules.commercial.domain.entities.company import CompanyStatus
from modules.commercial.domain.entities.lead import LeadStatus
from modules.commercial.domain.entities.opportunity import OpportunityStage


class CommercialLead(TenantScopedEntity):
    __tablename__ = "commercial_leads"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[LeadStatus] = mapped_column(Enum(LeadStatus, name="commercial_lead_status", native_enum=False), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CommercialCompany(TenantScopedEntity):
    __tablename__ = "commercial_companies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    trade_name: Mapped[str] = mapped_column(String(255), nullable=False)
    corporate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_number: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[CompanyStatus] = mapped_column(Enum(CompanyStatus, name="commercial_company_status", native_enum=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    contacts: Mapped[list["CommercialContact"]] = relationship("CommercialContact", back_populates="company", cascade="all, delete-orphan")
    service_locations: Mapped[list["CommercialServiceLocation"]] = relationship("CommercialServiceLocation", back_populates="company", cascade="all, delete-orphan")
    opportunities: Mapped[list["CommercialOpportunity"]] = relationship("CommercialOpportunity", back_populates="company", cascade="all, delete-orphan")

class CommercialContact(TenantScopedEntity):
    __tablename__ = "commercial_contacts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("commercial_companies.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    company: Mapped["CommercialCompany"] = relationship("CommercialCompany", back_populates="contacts")

class CommercialServiceLocation(TenantScopedEntity):
    __tablename__ = "commercial_service_locations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("commercial_companies.id"), nullable=False)
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    zip_code: Mapped[str] = mapped_column(String(20), nullable=False)
    coordinates: Mapped[str | None] = mapped_column(String(100), nullable=True)
    operating_hours: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)

    company: Mapped["CommercialCompany"] = relationship("CommercialCompany", back_populates="service_locations")

class CommercialOpportunity(TenantScopedEntity):
    __tablename__ = "commercial_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid6.uuid7)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("commercial_companies.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    estimated_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    stage: Mapped[OpportunityStage] = mapped_column(Enum(OpportunityStage, name="commercial_opportunity_stage", native_enum=False), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    expected_close_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company: Mapped["CommercialCompany"] = relationship("CommercialCompany", back_populates="opportunities")
