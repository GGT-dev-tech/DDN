from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from modules.commercial.domain.entities.lead import Lead
from modules.commercial.infrastructure.models import CommercialLead


class LeadRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, lead: Lead) -> None:
        db_lead = CommercialLead(
            id=lead.id,
            tenant_id=lead.tenant_id,
            company_name=lead.company_name,
            contact_name=lead.contact_name,
            status=lead.status,
            email=lead.email,
            phone=lead.phone,
            source_id=lead.source_id,
            address=lead.address,
            latitude=lead.latitude,
            longitude=lead.longitude,
            created_at=lead.created_at,
            updated_at=lead.updated_at
        )
        self.session.add(db_lead)
        # Note: in a real DDD setup, domain events should be dispatched here or via a UnitOfWork

    def _to_domain(self, db_lead: CommercialLead) -> Lead:
        return Lead(
            id=db_lead.id,
            tenant_id=db_lead.tenant_id,
            company_name=db_lead.company_name,
            contact_name=db_lead.contact_name,
            status=db_lead.status,
            email=db_lead.email,
            phone=db_lead.phone,
            source_id=db_lead.source_id,
            address=db_lead.address,
            latitude=db_lead.latitude,
            longitude=db_lead.longitude,
            created_at=db_lead.created_at,
            updated_at=db_lead.updated_at
        )

    async def get_by_id(self, tenant_id: UUID, lead_id: UUID) -> Lead | None:
        stmt = select(CommercialLead).where(
            CommercialLead.tenant_id == tenant_id,
            CommercialLead.id == lead_id
        )
        result = await self.session.execute(stmt)
        db_lead = result.scalar_one_or_none()
        
        if not db_lead:
            return None
            
        return self._to_domain(db_lead)

    async def update(self, lead: Lead) -> None:
        stmt = select(CommercialLead).where(
            CommercialLead.tenant_id == lead.tenant_id,
            CommercialLead.id == lead.id
        )
        result = await self.session.execute(stmt)
        db_lead = result.scalar_one_or_none()
        if db_lead:
            db_lead.company_name = lead.company_name
            db_lead.contact_name = lead.contact_name
            db_lead.status = lead.status
            db_lead.email = lead.email
            db_lead.phone = lead.phone
            db_lead.source_id = lead.source_id
            db_lead.address = lead.address
            db_lead.latitude = lead.latitude
            db_lead.longitude = lead.longitude
            db_lead.updated_at = lead.updated_at

    async def list_leads(self, tenant_id: UUID, skip: int = 0, limit: int = 100) -> list[Lead]:
        stmt = (
            select(CommercialLead)
            .where(CommercialLead.tenant_id == tenant_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        return [self._to_domain(db_lead) for db_lead in models]
