from datetime import date
from uuid import UUID

from modules.commercial.domain.entities.opportunity import Opportunity
from modules.commercial.infrastructure.repositories.opportunity_repository import (
    OpportunityRepository,
)


class OpportunityService:
    def __init__(self, opportunity_repo: OpportunityRepository):
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
