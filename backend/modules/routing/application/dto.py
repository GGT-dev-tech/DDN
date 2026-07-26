from datetime import date
from uuid import UUID

from pydantic import BaseModel


# Input DTOs
class CreateRouteRequestDTO(BaseModel):
    execution_date: date
    estimated_volume: float | None = None
    estimated_weight: float | None = None
    planned_distance: float | None = None
    planned_duration: float | None = None

class LocationDTO(BaseModel):
    latitude: float
    longitude: float
    address: str

class AddStopRequestDTO(BaseModel):
    route_id: UUID
    location: LocationDTO
    order: int

class AssignRouteResourcesRequestDTO(BaseModel):
    route_id: UUID
    vehicle_id: UUID
    driver_id: UUID

# Output DTOs
class StopResponseDTO(BaseModel):
    id: UUID
    latitude: float
    longitude: float
    address: str
    order: int
    status: str

class RouteResponseDTO(BaseModel):
    id: UUID
    execution_date: date
    status: str
    estimated_volume: float | None = None
    estimated_weight: float | None = None
    planned_distance: float | None = None
    planned_duration: float | None = None
    vehicle_id: UUID | None = None
    driver_id: UUID | None = None
    stops: list[StopResponseDTO]
