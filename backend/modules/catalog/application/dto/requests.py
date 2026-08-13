import uuid
from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from modules.catalog.domain.entities.service_attribute import AttributeType
from modules.catalog.domain.entities.unit_of_measure import UOMBaseType

# --- Unit of Measure ---

class RegisterUOMRequest(BaseModel):
    symbol: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    base_type: UOMBaseType

class UpdateUOMRequest(BaseModel):
    name: str = Field(..., max_length=255)

class UOMResponse(BaseModel):
    id: uuid.UUID

# --- Service Attribute ---

class DefineServiceAttributeRequest(BaseModel):
    name: str = Field(..., max_length=255)
    attribute_type: AttributeType
    possible_values: list[Any] = Field(default_factory=list)
    is_required: bool = False

class ServiceAttributeResponse(BaseModel):
    id: uuid.UUID

# --- Service Offering ---

class DraftServiceOfferingRequest(BaseModel):
    name: str = Field(..., max_length=255)
    description: str = Field(..., max_length=1000)
    category: str = Field(..., max_length=100)
    default_uom_id: uuid.UUID
    effective_date: date
    end_date: date | None = None

class UpdateServiceOfferingRequest(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=1000)
    category: str | None = Field(None, max_length=100)
    effective_date: date | None = None
    end_date: date | None = None

class AttachAttributeRequest(BaseModel):
    attribute_id: uuid.UUID
    allowed_values: list[Any]

class ServiceOfferingResponse(BaseModel):
    id: uuid.UUID
