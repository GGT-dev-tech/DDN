from datetime import date
from uuid import UUID

from modules.commercial.domain.entities.opportunity import Opportunity
from modules.commercial.infrastructure.repositories.opportunity_repository import (
    OpportunityRepository,
)


from modules.core.infrastructure.uow import UnitOfWork

class OpportunityService:
    def __init__(self, uow: UnitOfWork, opportunity_repo: OpportunityRepository):
        self.uow = uow
        self.opportunity_repo = opportunity_repo

    async def open_opportunity(
        self,
        tenant_id: UUID,
        company_id: UUID,
        title: str,
        estimated_value: float | None = None,
        source_id: str | None = None,
        expected_close_date: date | None = None
    ) -> Opportunity:
        
        opportunity = Opportunity.open(
            tenant_id=tenant_id,
            company_id=company_id,
            title=title,
            estimated_value=estimated_value,
            source_id=source_id,
            expected_close_date=expected_close_date
        )
        
        await self.opportunity_repo.add(opportunity)
        return opportunity

    async def list_opportunities(self, tenant_id: UUID, skip: int = 0, limit: int = 100) -> list[Opportunity]:
        return await self.opportunity_repo.list_opportunities(tenant_id, skip=skip, limit=limit)

    async def update_opportunity_stage(self, tenant_id: UUID, opportunity_id: UUID, stage: str) -> Opportunity:
        async with self.uow as uow:
            opportunity = await self.opportunity_repo.get_by_id(tenant_id, opportunity_id)
            if not opportunity:
                raise ValueError("Opportunity not found")
                
            from modules.commercial.domain.entities.opportunity import OpportunityStage
            try:
                new_stage = OpportunityStage(stage)
            except ValueError:
                raise ValueError("Invalid stage")
                
            opportunity.change_stage(new_stage)
            
            await self.opportunity_repo.update(opportunity)
            await uow.commit()
            return opportunity
