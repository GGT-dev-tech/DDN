from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from modules.fleet.application.repositories import FleetRepository
from modules.fleet.domain.entities.driver import Driver
from modules.fleet.domain.entities.vehicle import Vehicle
from modules.fleet.infrastructure.orm_models import DriverModel, VehicleModel


class SQLAlchemyFleetRepository(FleetRepository):
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def save_vehicle(self, vehicle: Vehicle) -> None:
        stmt = select(VehicleModel).where(VehicleModel.id == vehicle.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            model = VehicleModel(
                id=vehicle.id,
                tenant_id=vehicle.tenant_id,
                license_plate=vehicle.license_plate,
                vehicle_type=vehicle.vehicle_type,
                capacity_volume=vehicle.capacity_volume,
                capacity_weight=vehicle.capacity_weight,
                status=vehicle.status
            )
            self.session.add(model)
        else:
            model.status = vehicle.status
            model.license_plate = vehicle.license_plate
            model.vehicle_type = vehicle.vehicle_type
            model.capacity_volume = vehicle.capacity_volume
            model.capacity_weight = vehicle.capacity_weight

    async def get_vehicle_by_id(self, vehicle_id: UUID) -> Vehicle | None:
        stmt = select(VehicleModel).where(VehicleModel.id == vehicle_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return Vehicle(
            id=model.id,
            tenant_id=model.tenant_id,
            license_plate=model.license_plate,
            vehicle_type=model.vehicle_type,
            capacity_volume=model.capacity_volume,
            capacity_weight=model.capacity_weight,
            status=model.status
        )

    async def save_driver(self, driver: Driver) -> None:
        stmt = select(DriverModel).where(DriverModel.id == driver.id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            model = DriverModel(
                id=driver.id,
                tenant_id=driver.tenant_id,
                name=driver.name,
                license_number=driver.license_number,
                status=driver.status
            )
            self.session.add(model)
        else:
            model.name = driver.name
            model.license_number = driver.license_number
            model.status = driver.status

    async def get_driver_by_id(self, driver_id: UUID) -> Driver | None:
        stmt = select(DriverModel).where(DriverModel.id == driver_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return Driver(
            id=model.id,
            tenant_id=model.tenant_id,
            name=model.name,
            license_number=model.license_number,
            status=model.status
        )

    async def list_vehicles(self, tenant_id: UUID) -> list[Vehicle]:
        stmt = select(VehicleModel).where(VehicleModel.tenant_id == tenant_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [
            Vehicle(
                id=m.id,
                tenant_id=m.tenant_id,
                license_plate=m.license_plate,
                vehicle_type=m.vehicle_type,
                capacity_volume=m.capacity_volume,
                capacity_weight=m.capacity_weight,
                status=m.status
            )
            for m in models
        ]

    async def list_drivers(self, tenant_id: UUID) -> list[Driver]:
        stmt = select(DriverModel).where(DriverModel.tenant_id == tenant_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [
            Driver(
                id=m.id,
                tenant_id=m.tenant_id,
                name=m.name,
                license_number=m.license_number,
                status=m.status
            )
            for m in models
        ]
