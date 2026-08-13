from uuid import UUID
from pydantic import BaseModel
from modules.facilities.domain.value_objects import DestinationType

class AddressDTO(BaseModel):
    street: str
    number: str
    complement: str | None = None
    neighborhood: str
    city: str
    state: str
    zip_code: str
    latitude: float | None = None
    longitude: float | None = None

class CreateDestinationRequest(BaseModel):
    name: str
    type: DestinationType
    address: AddressDTO
    contact_name: str | None = None
    contact_phone: str | None = None

class UpdateDestinationRequest(BaseModel):
    name: str
    type: DestinationType
    address: AddressDTO
    contact_name: str | None = None
    contact_phone: str | None = None

class DestinationResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    type: DestinationType
    address: AddressDTO
    is_active: bool
    contact_name: str | None
    contact_phone: str | None
