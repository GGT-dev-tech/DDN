from modules.fleet.application.dto import DriverResponseDTO
from modules.fleet.application.repositories import FleetRepository

class ListDrivers:
    def __init__(self, repository: FleetRepository):
        self.repository = repository

    def execute(self) -> list[DriverResponseDTO]:
        drivers = self.repository.list_drivers()
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
