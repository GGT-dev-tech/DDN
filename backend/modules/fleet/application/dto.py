from uuid import UUID

from pydantic import BaseModel


class RegisterVehicleRequestDTO(BaseModel):
    license_plate: str
    vehicle_type: str
    capacity_volume: float
    capacity_weight: float

class VehicleResponseDTO(BaseModel):
    id: UUID
    license_plate: str
    vehicle_type: str
    capacity_volume: float
    capacity_weight: float
    status: str

class RegisterDriverRequestDTO(BaseModel):
    name: str
    license_number: str

class DriverResponseDTO(BaseModel):
    id: UUID
    name: str
    license_number: str
    status: str
