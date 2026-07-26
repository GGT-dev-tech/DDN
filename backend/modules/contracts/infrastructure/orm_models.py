from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.core.base import Base
from modules.contracts.domain.value_objects import ContractStatus


class ContractModel(Base):
    __tablename__ = "contracts_contracts"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    company_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    quotation_id = Column(UUID(as_uuid=True), index=True, nullable=True)
    status = Column(SQLEnum(ContractStatus, name="contractstatus", create_type=False), nullable=False)  # type: ignore
    
    effective_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=True)
    renewal_rule = Column(String, nullable=True)
    adjustment_rule = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    versions = relationship("ContractVersionModel", back_populates="contract", cascade="all, delete-orphan", order_by="ContractVersionModel.version_number")


class ContractVersionModel(Base):
    __tablename__ = "contracts_contract_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts_contracts.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False)
    
    contract = relationship("ContractModel", back_populates="versions")
    items = relationship("ContractItemModel", back_populates="version", cascade="all, delete-orphan")


class ContractItemModel(Base):
    __tablename__ = "contracts_contract_items"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    version_id = Column(UUID(as_uuid=True), ForeignKey("contracts_contract_versions.id"), nullable=False, index=True)
    service_offering_id = Column(UUID(as_uuid=True), nullable=False)
    unit_of_measure_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Numeric(15, 4), nullable=False)

    version = relationship("ContractVersionModel", back_populates="items")
    snapshot = relationship("ContractItemSnapshotModel", back_populates="item", uselist=False, cascade="all, delete-orphan")


class ContractItemSnapshotModel(Base):
    __tablename__ = "contracts_contract_item_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    contract_item_id = Column(UUID(as_uuid=True), ForeignKey("contracts_contract_items.id"), nullable=False, index=True, unique=True)
    
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

    item = relationship("ContractItemModel", back_populates="snapshot")
