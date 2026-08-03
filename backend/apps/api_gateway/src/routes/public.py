from fastapi import APIRouter, Depends, HTTPException
from modules.tenant.infrastructure.orm_models import ORMTenant
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api_gateway.src.routes.commercial import (
    LeadRegisterRequest,
    LeadResponse,
    get_lead_service,
)
from database.session import get_db_session
from modules.commercial.application.services.lead_service import LeadService

router = APIRouter(prefix="/public", tags=["Public"])

@router.post("/leads", response_model=LeadResponse)
async def register_public_lead(
    req: LeadRegisterRequest,
    session: AsyncSession = Depends(get_db_session),
    lead_service: LeadService = Depends(get_lead_service)
):
    """
    Public endpoint to register a lead without authentication.
    Automatically assigns the lead to the first available tenant (default tenant).
    """
    # Find the default tenant
    stmt = select(ORMTenant).limit(1)
    result = await session.execute(stmt)
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=500, detail="No tenant available to receive leads")

    lead = await lead_service.register_lead(
        tenant_id=tenant.id,
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
