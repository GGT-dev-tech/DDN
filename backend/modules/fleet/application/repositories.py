from abc import ABC, abstractmethod
from uuid import UUID

from modules.fleet.domain.entities.driver import Driver
from modules.fleet.domain.entities.vehicle import Vehicle


class FleetRepository(ABC):
    @abstractmethod
    def save_vehicle(self, vehicle: Vehicle) -> None:
        pass
        
    @abstractmethod
    def get_vehicle_by_id(self, vehicle_id: UUID) -> Vehicle | None:
        pass

    @abstractmethod
    def save_driver(self, driver: Driver) -> None:
        pass
        
    @abstractmethod
    def get_driver_by_id(self, driver_id: UUID) -> Driver | None:
        pass

    @abstractmethod
    def list_vehicles(self) -> list[Vehicle]:
        pass

    @abstractmethod
    def list_drivers(self) -> list[Driver]:
        pass
