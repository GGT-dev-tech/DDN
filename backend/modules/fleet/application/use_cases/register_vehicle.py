from sqlalchemy.ext.asyncio import AsyncSession

from modules.core.context import ContextAccessor
from modules.fleet.application.dto import RegisterVehicleRequestDTO, VehicleResponseDTO
from modules.fleet.application.repositories import FleetRepository
from modules.fleet.domain.entities.vehicle import Vehicle, VehicleType


class RegisterVehicleUseCase:
    def __init__(self, session: AsyncSession, fleet_repository: FleetRepository, context_accessor: ContextAccessor):
        self.session = session
        self.fleet_repository = fleet_repository
        self.context_accessor = context_accessor

    async def execute(self, dto: RegisterVehicleRequestDTO) -> VehicleResponseDTO:
        tenant_ctx = self.context_accessor.tenant()
        if not tenant_ctx or not tenant_ctx.tenant_id:
            raise ValueError("Tenant context is required")
            
        vehicle = Vehicle.create(
            tenant_id=tenant_ctx.tenant_id,
            license_plate=dto.license_plate,
            vehicle_type=VehicleType(dto.vehicle_type),
            capacity_volume=dto.capacity_volume,
            capacity_weight=dto.capacity_weight
        )
        
        await self.fleet_repository.save_vehicle(vehicle)
        vehicle.clear_events()
        await self.session.commit()
            
        return VehicleResponseDTO(
            id=vehicle.id,
            license_plate=vehicle.license_plate,
            vehicle_type=vehicle.vehicle_type.value,
            capacity_volume=vehicle.capacity_volume,
            capacity_weight=vehicle.capacity_weight,
            status=vehicle.status.value
        )
