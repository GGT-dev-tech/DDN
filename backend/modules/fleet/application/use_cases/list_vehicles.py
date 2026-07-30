from modules.fleet.application.dto import VehicleResponseDTO
from modules.fleet.application.repositories import FleetRepository

from uuid import UUID

class ListVehicles:
    def __init__(self, repository: FleetRepository):
        self.repository = repository

    async def execute(self, tenant_id: UUID) -> list[VehicleResponseDTO]:
        vehicles = await self.repository.list_vehicles(tenant_id)
        return [
            VehicleResponseDTO(
                id=v.id,
                tenant_id=v.tenant_id,
                license_plate=v.license_plate,
                vehicle_type=v.vehicle_type,
                capacity_volume=v.capacity_volume,
                capacity_weight=v.capacity_weight,
                status=v.status
            )
            for v in vehicles
        ]
