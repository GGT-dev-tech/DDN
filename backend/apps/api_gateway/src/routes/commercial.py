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
    from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
    uow = SQLAlchemyUnitOfWork(session)
    repo = CompanyRepository(session)
    return CompanyService(uow, repo)

def get_opportunity_service(session: AsyncSession = Depends(get_db_session)) -> OpportunityService:
    repo = OpportunityRepository(session)
    return OpportunityService(repo)

def get_lead_service(
    session: AsyncSession = Depends(get_db_session),
    company_service: CompanyService = Depends(get_company_service),
    opportunity_service: OpportunityService = Depends(get_opportunity_service)
) -> LeadService:
    from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
    
    uow = SQLAlchemyUnitOfWork(session)
    repo = LeadRepository(session)
    return LeadService(uow, repo, company_service, opportunity_service)

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

# Schemas
class LeadRegisterRequest(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr | None = None
    phone: str | None = None
    source_id: str | None = None
    address: str | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)

    @model_validator(mode="after")
    def validate_contact_info(self) -> "LeadRegisterRequest":
        if not self.email and not self.phone:
            raise ValueError("Pelo menos email ou telefone deve ser fornecido")
        return self

class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    company_name: str
    contact_name: str
    email: str | None = None
    phone: str | None = None
    status: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    trade_name: str
    corporate_name: str
    document_number: str
    status: str

class AddContactRequest(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    is_primary: bool = False

class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    company_id: UUID
    name: str
    email: str
    phone: str
    role: str
    is_primary: bool

class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    company_id: UUID
    title: str
    estimated_value: float | None = None
    stage: str
    source_id: str | None = None
    expected_close_date: str | None = None

class MatchLeadRequest(BaseModel):
    company_id: UUID | None = None
    trade_name: str | None = None
    corporate_name: str | None = None
    document_number: str | None = None

    @model_validator(mode="after")
    def validate_match_data(self) -> "MatchLeadRequest":
        if not self.company_id and not all([self.trade_name, self.corporate_name, self.document_number]):
            raise ValueError("Deve fornecer company_id ou (trade_name, corporate_name, document_number)")
        return self

# Routes
@router.get("/leads", response_model=list[LeadResponse])
async def list_leads(
    tenant_id: UUID = Depends(require_tenant),
    skip: int = 0,
    limit: int = 100,
    lead_service: LeadService = Depends(get_lead_service)
):
    leads = await lead_service.list_leads(tenant_id, skip=skip, limit=limit)
    return leads

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
        source_id=req.source_id,
        address=req.address,
        latitude=req.latitude,
        longitude=req.longitude
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

@router.get("/companies", response_model=list[CompanyResponse])
async def list_companies(
    tenant_id: UUID = Depends(require_tenant),
    skip: int = 0,
    limit: int = 100,
    company_service: CompanyService = Depends(get_company_service)
):
    companies = await company_service.list_companies(tenant_id, skip=skip, limit=limit)
    return companies

@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    tenant_id: UUID = Depends(require_tenant),
    company_service: CompanyService = Depends(get_company_service)
):
    company = await company_service.get_company(tenant_id, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/companies/{company_id}/contacts", response_model=ContactResponse)
async def add_contact(
    company_id: UUID,
    req: AddContactRequest,
    tenant_id: UUID = Depends(require_tenant),
    company_service: CompanyService = Depends(get_company_service)
):
    try:
        contact = await company_service.add_contact_to_company(
            tenant_id=tenant_id,
            company_id=company_id,
            name=req.name,
            email=req.email,
            phone=req.phone,
            role=req.role,
            is_primary=req.is_primary
        )
        return contact
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/opportunities", response_model=list[OpportunityResponse])
async def list_opportunities(
    tenant_id: UUID = Depends(require_tenant),
    skip: int = 0,
    limit: int = 100,
    opportunity_service: OpportunityService = Depends(get_opportunity_service)
):
    opportunities = await opportunity_service.list_opportunities(tenant_id, skip=skip, limit=limit)
    return opportunities
