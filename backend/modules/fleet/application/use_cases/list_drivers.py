from uuid import UUID

from modules.fleet.application.dto import DriverResponseDTO
from modules.fleet.application.repositories import FleetRepository


class ListDrivers:
    def __init__(self, repository: FleetRepository):
        self.repository = repository

    async def execute(self, tenant_id: UUID) -> list[DriverResponseDTO]:
        drivers = await self.repository.list_drivers(tenant_id)
        return [
            DriverResponseDTO(
                id=d.id,
                tenant_id=d.tenant_id,
                name=d.name,
                license_number=d.license_number,
                status=d.status
            )
            for d in drivers
        ]
