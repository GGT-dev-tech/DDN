from uuid import UUID

from modules.commercial.application.services.company_service import CompanyService
from modules.commercial.application.services.opportunity_service import OpportunityService
from modules.commercial.domain.entities.lead import Lead
from modules.commercial.infrastructure.repositories.lead_repository import LeadRepository


class LeadService:
    def __init__(
        self,
        lead_repo: LeadRepository,
        company_service: CompanyService,
        opportunity_service: OpportunityService
    ):
        self.lead_repo = lead_repo
        self.company_service = company_service
        self.opportunity_service = opportunity_service

    async def register_lead(
        self,
        tenant_id: UUID,
        company_name: str,
        contact_name: str,
        email: str | None = None,
        phone: str | None = None,
        source_id: str | None = None
    ) -> Lead:
        lead = Lead.register(
            tenant_id=tenant_id,
            company_name=company_name,
            contact_name=contact_name,
            email=email,
            phone=phone,
            source_id=source_id
        )
        await self.lead_repo.add(lead)
        return lead

    async def qualify_lead(self, tenant_id: UUID, lead_id: UUID) -> Lead:
        lead = await self.lead_repo.get_by_id(tenant_id, lead_id)
        if not lead:
            raise ValueError(f"Lead {lead_id} not found")
            
        lead.qualify()
        await self.lead_repo.update(lead)
        return lead

    async def match_to_company(
        self,
        tenant_id: UUID,
        lead_id: UUID,
        company_id: UUID | None = None,
        # If company_id is None, we need details to create a new one:
        trade_name: str | None = None,
        corporate_name: str | None = None,
        document_number: str | None = None
    ):
        """
        Converts a Lead by matching it to an existing Company, or creating a new one.
        Then opens an Opportunity.
        """
        lead = await self.lead_repo.get_by_id(tenant_id, lead_id)
        if not lead:
            raise ValueError(f"Lead {lead_id} not found")
            
        if not company_id:
            # Create a new company
            if not all([trade_name, corporate_name, document_number]):
                raise ValueError("Must provide company details to create a new company on match")
                
            company = await self.company_service.create_company(
                tenant_id=tenant_id,
                trade_name=trade_name,
                corporate_name=corporate_name,
                document_number=document_number
            )
            company_id = company.id
        else:
            # Validate existing company
            company = await self.company_service.get_company(tenant_id, company_id)
            if not company:
                raise ValueError(f"Company {company_id} not found for match")
                
        # Convert lead
        lead.convert()
        await self.lead_repo.update(lead)
        
        # Open Opportunity
        opportunity = await self.opportunity_service.open_opportunity(
            tenant_id=tenant_id,
            company_id=company_id,
            title=f"Opportunity from Lead: {lead.company_name}",
            source_id=lead.source_id
        )
        
        return {
            "lead": lead,
            "company_id": company_id,
            "opportunity": opportunity
        }
