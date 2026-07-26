from database.core.unit_of_work import UnitOfWork
from modules.core.context import ContextAccessor
from modules.fleet.application.dto import DriverResponseDTO, RegisterDriverRequestDTO
from modules.fleet.application.repositories import FleetRepository
from modules.fleet.domain.entities.driver import Driver


class RegisterDriverUseCase:
    def __init__(self, uow: UnitOfWork, fleet_repository: FleetRepository, context_accessor: ContextAccessor):
        self.uow = uow
        self.fleet_repository = fleet_repository
        self.context_accessor = context_accessor

    def execute(self, dto: RegisterDriverRequestDTO) -> DriverResponseDTO:
        tenant_ctx = self.context_accessor.tenant()
        if not tenant_ctx or not tenant_ctx.tenant_id:
            raise ValueError("Tenant context is required")
            
        driver = Driver.create(
            tenant_id=tenant_ctx.tenant_id,
            name=dto.name,
            license_number=dto.license_number
        )
        
        with self.uow.begin():
            self.fleet_repository.save_driver(driver)
            self.uow.collect_events(driver)
            self.uow.commit()
            
        return DriverResponseDTO(
            id=driver.id,
            name=driver.name,
            license_number=driver.license_number,
            status=driver.status.value
        )
