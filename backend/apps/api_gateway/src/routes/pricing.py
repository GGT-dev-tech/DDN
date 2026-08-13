from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.identity.dependencies import require_tenant
from modules.pricing.application.dto.requests import (
    MoneyResponse,
    PriceCalculationRequest,
    PriceCalculationResponse,
    PriceTableCreateRequest,
    PriceTableItemCreateRequest,
    PriceTableResponse,
    PricingRuleCreateRequest,
)
from modules.pricing.application.services.pricing_service import PricingService
from modules.pricing.domain.services.price_calculation_engine import PriceCalculationEngine
from modules.pricing.infrastructure.repositories.pricing_repository import PricingRepository

router = APIRouter(prefix="/pricing", tags=["Pricing"])

from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork

def get_pricing_service(session: AsyncSession = Depends(get_db_session)) -> PricingService:
    uow = SQLAlchemyUnitOfWork(session)
    repository = PricingRepository(session)
    engine = PriceCalculationEngine()
    return PricingService(uow, repository, engine)

@router.get("/tables", response_model=list[PriceTableResponse], status_code=status.HTTP_200_OK)
async def list_price_tables(
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    tables = await service.list_price_tables(tenant_id)
    return tables

@router.get("/tables/{table_id}", response_model=PriceTableResponse, status_code=status.HTTP_200_OK)
async def get_price_table(
    table_id: UUID,
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    table = await service.get_price_table(tenant_id, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Price table not found")
    return table

@router.post("/tables", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_price_table(
    request: PriceTableCreateRequest,
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    table_id = await service.create_price_table(
        tenant_id=tenant_id,
        name=request.name,
        effective_date=request.effective_date,
        end_date=request.end_date,
        region_id=request.region_id,
        customer_id=request.customer_id,
        is_active=request.is_active
    )
    return {"id": table_id}

@router.post("/tables/{table_id}/items", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_price_table_item(
    table_id: UUID,
    request: PriceTableItemCreateRequest,
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    try:
        item_id = await service.add_price_table_item(
            tenant_id=tenant_id,
            price_table_id=table_id,
            service_offering_id=request.service_offering_id,
            unit_of_measure_id=request.unit_of_measure_id,
            amount=request.amount,
            currency=request.currency
        )
        return {"id": item_id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/rules", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_pricing_rule(
    request: PricingRuleCreateRequest,
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    try:
        rule_id = await service.create_pricing_rule(
            tenant_id=tenant_id,
            name=request.name,
            scope=request.scope,
            rule_type=request.rule_type,
            value=request.value,
            priority=request.priority,
            customer_id=request.customer_id,
            service_offering_id=request.service_offering_id,
            region_id=request.region_id
        )
        return {"id": rule_id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/calculate", response_model=PriceCalculationResponse, status_code=status.HTTP_200_OK)
async def calculate_price(
    request: PriceCalculationRequest,
    tenant_id: UUID = Depends(require_tenant),
    service: PricingService = Depends(get_pricing_service)
) -> Any:
    try:
        result = await service.calculate_price(
            service_offering_id=request.service_offering_id,
            unit_of_measure_id=request.unit_of_measure_id,
            quantity=request.quantity,
            reference_date=request.reference_date,
            region_id=request.region_id,
            customer_id=request.customer_id
        )
        return PriceCalculationResponse(
            service_offering_id=result.service_offering_id,
            unit_of_measure_id=result.unit_of_measure_id,
            quantity=result.quantity,
            base_unit_price=MoneyResponse(amount=result.base_unit_price.amount, currency=result.base_unit_price.currency),
            total_base_price=MoneyResponse(amount=result.total_base_price.amount, currency=result.total_base_price.currency),
            final_price=MoneyResponse(amount=result.final_price.amount, currency=result.final_price.currency),
            applied_rules_ids=result.applied_rules_ids
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
