from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from modules.commercial.domain.entities.opportunity import Opportunity
from modules.commercial.infrastructure.models import CommercialOpportunity


class OpportunityRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, opportunity: Opportunity) -> None:
        db_opportunity = CommercialOpportunity(
            id=opportunity.id,
            tenant_id=opportunity.tenant_id,
            company_id=opportunity.company_id,
            title=opportunity.title,
            estimated_value=opportunity.estimated_value,
            stage=opportunity.stage,
            source_id=opportunity.source_id,
            expected_close_date=opportunity.expected_close_date,
            created_at=opportunity.created_at,
            updated_at=opportunity.updated_at
        )
        self.session.add(db_opportunity)

    async def get_by_id(self, tenant_id: UUID, opportunity_id: UUID) -> Opportunity | None:
        stmt = select(CommercialOpportunity).where(
            CommercialOpportunity.tenant_id == tenant_id,
            CommercialOpportunity.id == opportunity_id
        )
        result = await self.session.execute(stmt)
        db_opportunity = result.scalar_one_or_none()
        
        if not db_opportunity:
            return None
            
        return Opportunity(
            id=db_opportunity.id,
            tenant_id=db_opportunity.tenant_id,
            company_id=db_opportunity.company_id,
            title=db_opportunity.title,
            estimated_value=db_opportunity.estimated_value,
            stage=db_opportunity.stage,
            source_id=db_opportunity.source_id,
            expected_close_date=db_opportunity.expected_close_date,
            created_at=db_opportunity.created_at,
            updated_at=db_opportunity.updated_at
        )

    async def update(self, opportunity: Opportunity) -> None:
        stmt = select(CommercialOpportunity).where(
            CommercialOpportunity.tenant_id == opportunity.tenant_id,
            CommercialOpportunity.id == opportunity.id
        )
        result = await self.session.execute(stmt)
        db_opportunity = result.scalar_one_or_none()
        if db_opportunity:
            db_opportunity.title = opportunity.title
            db_opportunity.estimated_value = opportunity.estimated_value
            db_opportunity.stage = opportunity.stage
            db_opportunity.source_id = opportunity.source_id
            db_opportunity.expected_close_date = opportunity.expected_close_date
            db_opportunity.updated_at = opportunity.updated_at
