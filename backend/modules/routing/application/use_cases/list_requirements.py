from dataclasses import dataclass
from uuid import UUID

from modules.routing.infrastructure.repositories.sqlalchemy_requirement_repository import (
    SQLAlchemyRequirementRepository,
)


@dataclass
class RequirementDTO:
    id: str
    service_name: str
    address: str
    quantity: float
    unit_of_measure: str
    frequency: str
    start_time: str
    end_time: str
    status: str
    origin_reference: str

class ListRequirementsUseCase:
    def __init__(self, repo: SQLAlchemyRequirementRepository):
        self.repo = repo

    async def execute(self, tenant_id: UUID) -> list[RequirementDTO]:
        reqs = await self.repo.list_active_requirements(tenant_id)
        
        dtos = []
        for r in reqs:
            dtos.append(
                RequirementDTO(
                    id=str(r.id),
                    service_name=r.service_name,
                    address=r.location.address,
                    quantity=float(r.quantity),
                    unit_of_measure=r.unit_of_measure,
                    frequency=r.recurrence.frequency.value,
                    start_time=r.recurrence.start_time.strftime("%H:%M"),
                    end_time=r.recurrence.end_time.strftime("%H:%M"),
                    status=r.status.value,
                    origin_reference=r.origin_reference,
                )
            )
        return dtos
