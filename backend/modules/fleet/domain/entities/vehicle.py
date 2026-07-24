from dataclasses import dataclass
from enum import Enum
from uuid import UUID

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator

class VehicleType(Enum):
    COMPACTOR_TRUCK = "COMPACTOR_TRUCK"
    ROLL_OFF_TRUCK = "ROLL_OFF_TRUCK"
    VACUUM_TRUCK = "VACUUM_TRUCK"
    VAN = "VAN"

class VehicleStatus(Enum):
    ACTIVE = "ACTIVE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"

class InvalidVehicleCapacityException(Exception):
    pass

class InvalidVehicleStatusTransitionException(Exception):
    pass

class VehicleNotAvailableException(Exception):
    pass

@dataclass
class Vehicle(AggregateRoot):
    id: UUID
    tenant_id: UUID
    license_plate: str
    vehicle_type: VehicleType
    capacity_volume: float
    capacity_weight: float
    status: VehicleStatus

    @classmethod
    def create(cls, tenant_id: UUID, license_plate: str, vehicle_type: VehicleType, capacity_volume: float, capacity_weight: float) -> "Vehicle":
        if capacity_volume <= 0 or capacity_weight <= 0:
            raise InvalidVehicleCapacityException("Capacity must be positive.")
            
        vehicle = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            license_plate=license_plate,
            vehicle_type=vehicle_type,
            capacity_volume=capacity_volume,
            capacity_weight=capacity_weight,
            status=VehicleStatus.ACTIVE
        )
        return vehicle

    def put_in_maintenance(self):
        if self.status == VehicleStatus.MAINTENANCE:
            return
        
        self.status = VehicleStatus.MAINTENANCE

    def activate(self):
        if self.status == VehicleStatus.ACTIVE:
            return
            
        self.status = VehicleStatus.ACTIVE
        
    def deactivate(self):
        self.status = VehicleStatus.INACTIVE

    def check_availability(self):
        if self.status != VehicleStatus.ACTIVE:
            raise VehicleNotAvailableException(f"Vehicle {self.id} is {self.status.value} and cannot be assigned.")
