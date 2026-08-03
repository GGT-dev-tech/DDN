import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.billing.application.services.billing_engine_service import BillingEngineService
from modules.billing.infrastructure.repositories.sql_invoice_repository import SQLInvoiceRepository
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/billing", tags=["Billing"])


class InvoiceItemSchema(BaseModel):
    id: uuid.UUID
    service_offering_id: uuid.UUID
    service_name: str
    quantity: float
    unit_price: float
    total_price: float
    service_order_id: uuid.UUID | None = None
    model_config = ConfigDict(from_attributes=True)


class InvoiceSchema(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    reference_month: str
    status: str
    total_amount: float
    items: list[InvoiceItemSchema]
    model_config = ConfigDict(from_attributes=True)


def get_billing_service(session: AsyncSession = Depends(get_db_session)) -> BillingEngineService:
    repo = SQLInvoiceRepository(session)
    return BillingEngineService(session, repo)


@router.get("/invoices", response_model=list[InvoiceSchema])
async def list_invoices(
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)]
):
    repo = SQLInvoiceRepository(session)
    domain_invoices = await repo.get_by_tenant(tenant_id)
    
    result = []
    for inv in domain_invoices:
        # Convert domain model to schema dictionary manually since we don't have an ORM object anymore directly
        result.append({
            "id": inv.id,
            "company_id": inv.company_id,
            "reference_month": inv.reference_month,
            "status": inv.status,
            "total_amount": float(inv.total_amount),
            "items": [
                {
                    "id": item.id,
                    "service_offering_id": item.service_offering_id,
                    "service_name": item.service_name,
                    "quantity": float(item.quantity),
                    "unit_price": float(item.unit_price),
                    "total_price": float(item.total_price),
                    "service_order_id": item.service_order_id
                }
                for item in inv.items
            ]
        })
    return result


@router.post("/invoices/generate")
async def generate_invoices(
    reference_month: str = Query(..., description="Format: YYYY-MM"),
    tenant_id: uuid.UUID = Depends(require_tenant),
    service: BillingEngineService = Depends(get_billing_service)
):
    """
    Triggers the generation of invoices for all COMPLETED service orders in the reference month.
    """
    generated = await service.generate_monthly_invoices(tenant_id, reference_month)
    return {"message": "Invoices generated successfully", "count": generated}
