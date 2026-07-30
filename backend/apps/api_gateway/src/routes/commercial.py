from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.commercial.application.services.company_service import CompanyService
from modules.commercial.application.services.lead_service import LeadService
from modules.commercial.application.services.opportunity_service import OpportunityService
from modules.commercial.infrastructure.repositories.company_repository import CompanyRepository
from modules.commercial.infrastructure.repositories.lead_repository import LeadRepository
from modules.commercial.infrastructure.repositories.opportunity_repository import (
    OpportunityRepository,
)
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/commercial", tags=["Commercial"])

# Dependency Providers
def get_company_service(session: AsyncSession = Depends(get_db_session)) -> CompanyService:
    repo = CompanyRepository(session)
    return CompanyService(repo)

def get_opportunity_service(session: AsyncSession = Depends(get_db_session)) -> OpportunityService:
    repo = OpportunityRepository(session)
    return OpportunityService(repo)

def get_lead_service(
    session: AsyncSession = Depends(get_db_session),
    company_service: CompanyService = Depends(get_company_service),
    opportunity_service: OpportunityService = Depends(get_opportunity_service)
) -> LeadService:
    repo = LeadRepository(session)
    return LeadService(repo, company_service, opportunity_service)

# Schemas
class LeadRegisterRequest(BaseModel):
    company_name: str
    contact_name: str
    email: str | None = None
    phone: str | None = None
    source_id: str | None = None

class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    company_name: str
    contact_name: str
    email: str | None = None
    status: str

class MatchLeadRequest(BaseModel):
    company_id: UUID | None = None
    trade_name: str | None = None
    corporate_name: str | None = None
    document_number: str | None = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    trade_name: str
    corporate_name: str
    document_number: str
    status: str

# Routes
@router.get("/leads", response_model=list[LeadResponse])
async def list_leads(
    tenant_id: UUID = Depends(require_tenant),
    lead_service: LeadService = Depends(get_lead_service)
):
    leads = await lead_service.list_leads(tenant_id)
    return leads

@router.get("/companies", response_model=list[CompanyResponse])
async def list_companies(
    tenant_id: UUID = Depends(require_tenant),
    company_service: CompanyService = Depends(get_company_service)
):
    companies = await company_service.list_companies(tenant_id)
    return companies

@router.post("/leads", response_model=LeadResponse)
async def register_lead(
    req: LeadRegisterRequest,
    tenant_id: UUID = Depends(require_tenant),
    lead_service: LeadService = Depends(get_lead_service)
):
    lead = await lead_service.register_lead(
        tenant_id=tenant_id,
        company_name=req.company_name,
        contact_name=req.contact_name,
        email=req.email,
        phone=req.phone,
        source_id=req.source_id
    )
    return lead

@router.post("/leads/{lead_id}/qualify", response_model=LeadResponse)
async def qualify_lead(
    lead_id: UUID,
    tenant_id: UUID = Depends(require_tenant),
    lead_service: LeadService = Depends(get_lead_service)
):
    try:
        lead = await lead_service.qualify_lead(tenant_id, lead_id)
        return lead
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/leads/{lead_id}/match")
async def match_lead_to_company(
    lead_id: UUID,
    req: MatchLeadRequest,
    tenant_id: UUID = Depends(require_tenant),
    lead_service: LeadService = Depends(get_lead_service)
):
    try:
        result = await lead_service.match_to_company(
            tenant_id=tenant_id,
            lead_id=lead_id,
            company_id=req.company_id,
            trade_name=req.trade_name,
            corporate_name=req.corporate_name,
            document_number=req.document_number
        )
        return {
            "lead_id": result["lead"].id,
            "company_id": result["company_id"],
            "opportunity_id": result["opportunity"].id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
