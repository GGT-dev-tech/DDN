from abc import ABC, abstractmethod
from uuid import UUID

from modules.fleet.domain.entities.driver import Driver
from modules.fleet.domain.entities.vehicle import Vehicle


class FleetRepository(ABC):
    @abstractmethod
    async def save_vehicle(self, vehicle: Vehicle) -> None:
        pass
        
    @abstractmethod
    async def get_vehicle_by_id(self, vehicle_id: UUID) -> Vehicle | None:
        pass

    @abstractmethod
    async def save_driver(self, driver: Driver) -> None:
        pass
        
    @abstractmethod
    async def get_driver_by_id(self, driver_id: UUID) -> Driver | None:
        pass

    @abstractmethod
    async def list_vehicles(self, tenant_id: UUID) -> list[Vehicle]:
        pass

    @abstractmethod
    async def list_drivers(self, tenant_id: UUID) -> list[Driver]:
        pass
