import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database.session import get_db_session
from modules.identity.dependencies import require_tenant
from modules.quotations.application.services.quotation_service import QuotationService
from modules.quotations.infrastructure.adapters.pricing_gateway_impl import PricingGatewayImpl
from modules.quotations.infrastructure.adapters.catalog_gateway_impl import CatalogGatewayImpl
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository
from modules.pricing.application.services.pricing_service import PricingService
from modules.pricing.infrastructure.repositories.pricing_repository import PricingRepository
from modules.pricing.domain.services.price_calculation_engine import PriceCalculationEngine


router = APIRouter(prefix="/quotations", tags=["Quotations"])


class CreateQuotationRequest(BaseModel):
    company_id: uuid.UUID
    validity_days: int = 30


class AddQuotationItemRequest(BaseModel):
    service_offering_id: uuid.UUID
    unit_of_measure_id: uuid.UUID
    quantity: Decimal


class CalculateQuotationRequest(BaseModel):
    reference_date: date


def get_quotation_service(session=Depends(get_db_session)) -> QuotationService:
    repo = QuotationRepository(session)
    
    # Instantiate pricing pieces for the gateway
    pricing_repo = PricingRepository(session)
    calculation_engine = PriceCalculationEngine()
    pricing_service = PricingService(session, pricing_repo, calculation_engine)
    
    pricing_gateway = PricingGatewayImpl(pricing_service)
    catalog_gateway = CatalogGatewayImpl(session)
    
    return QuotationService(session, repo, pricing_gateway, catalog_gateway)


@router.post("")
async def create_quotation(
    request: CreateQuotationRequest,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: QuotationService = Depends(get_quotation_service)
) -> dict:
    quotation_id = await service.create_quotation(
        tenant_id=tenant_id,
        company_id=request.company_id,
        validity_days=request.validity_days
    )
    return {"quotation_id": quotation_id}


@router.post("/{quotation_id}/items")
async def add_quotation_item(
    quotation_id: uuid.UUID,
    request: AddQuotationItemRequest,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: QuotationService = Depends(get_quotation_service)
) -> dict:
    try:
        item_id = await service.add_item(
            quotation_id=quotation_id,
            service_offering_id=request.service_offering_id,
            unit_of_measure_id=request.unit_of_measure_id,
            quantity=request.quantity
        )
        return {"item_id": item_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{quotation_id}/calculate")
async def calculate_quotation(
    quotation_id: uuid.UUID,
    request: CalculateQuotationRequest,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: QuotationService = Depends(get_quotation_service)
) -> dict:
    try:
        await service.calculate(
            quotation_id=quotation_id,
            reference_date=request.reference_date
        )
        return {"message": "Quotation priced successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{quotation_id}/submit")
async def submit_quotation(
    quotation_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: QuotationService = Depends(get_quotation_service)
) -> dict:
    try:
        await service.submit(quotation_id=quotation_id)
        return {"message": "Quotation submitted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{quotation_id}/approve")
async def approve_quotation(
    quotation_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: QuotationService = Depends(get_quotation_service)
) -> dict:
    try:
        await service.approve(quotation_id=quotation_id)
        return {"message": "Quotation approved successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
