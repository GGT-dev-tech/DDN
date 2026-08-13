import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID

from database.core.base import Base
from modules.facilities.domain.value_objects import DestinationType


class DestinationModel(Base):
    __tablename__ = "facilities_destinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(DestinationType, name="destinationtype"), nullable=False)
    
    # Address VO flattened
    address_street = Column(String(255), nullable=False)
    address_number = Column(String(50), nullable=False)
    address_complement = Column(String(255), nullable=True)
    address_neighborhood = Column(String(100), nullable=False)
    address_city = Column(String(100), nullable=False)
    address_state = Column(String(50), nullable=False)
    address_zip_code = Column(String(20), nullable=False)
    address_latitude = Column(String(50), nullable=True)
    address_longitude = Column(String(50), nullable=True)
    
    is_active = Column(Boolean, nullable=False, default=True)
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)
