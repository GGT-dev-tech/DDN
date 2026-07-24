from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from modules.fleet.domain.entities.vehicle import Vehicle
from modules.fleet.domain.entities.driver import Driver

class FleetRepository(ABC):
    @abstractmethod
    def save_vehicle(self, vehicle: Vehicle) -> None:
        pass
        
    @abstractmethod
    def get_vehicle_by_id(self, vehicle_id: UUID) -> Optional[Vehicle]:
        pass

    @abstractmethod
    def save_driver(self, driver: Driver) -> None:
        pass
        
    @abstractmethod
    def get_driver_by_id(self, driver_id: UUID) -> Optional[Driver]:
        pass
