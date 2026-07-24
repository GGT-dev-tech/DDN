from dataclasses import dataclass
from enum import Enum
from uuid import UUID

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator

class DriverStatus(Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    OFF_DUTY = "OFF_DUTY"

class InvalidDriverStatusTransitionException(Exception):
    pass

class DriverNotAvailableException(Exception):
    pass

@dataclass
class Driver(AggregateRoot):
    id: UUID
    tenant_id: UUID
    name: str
    license_number: str
    status: DriverStatus

    @classmethod
    def create(cls, tenant_id: UUID, name: str, license_number: str) -> "Driver":
        driver = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            name=name,
            license_number=license_number,
            status=DriverStatus.AVAILABLE
        )
        return driver

    def go_off_duty(self):
        if self.status == DriverStatus.ASSIGNED:
            raise InvalidDriverStatusTransitionException("Assigned driver cannot go off duty.")
        self.status = DriverStatus.OFF_DUTY

    def become_available(self):
        if self.status == DriverStatus.ASSIGNED:
            raise InvalidDriverStatusTransitionException("Assigned driver must be unassigned before becoming available.")
        self.status = DriverStatus.AVAILABLE
        
    def assign(self):
        if self.status != DriverStatus.AVAILABLE:
            raise DriverNotAvailableException(f"Driver {self.id} is {self.status.value} and cannot be assigned.")
        self.status = DriverStatus.ASSIGNED
        
    def unassign(self):
        if self.status == DriverStatus.ASSIGNED:
            self.status = DriverStatus.AVAILABLE

    def check_availability(self):
        if self.status != DriverStatus.AVAILABLE:
            raise DriverNotAvailableException(f"Driver {self.id} is {self.status.value} and cannot be assigned.")
