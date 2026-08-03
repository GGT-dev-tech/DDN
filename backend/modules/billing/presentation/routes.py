import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.billing.application.services.billing_job import DailyBillingJob
from modules.billing.infrastructure.repositories.sqlalchemy_invoice_repository import (
    SQLAlchemyInvoiceRepository,
)
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/billing", tags=["Billing"])


def get_invoice_repository(session: AsyncSession = Depends(get_db_session)):
    return SQLAlchemyInvoiceRepository(session)


class InvoiceItemSchema(BaseModel):
    id: uuid.UUID
    service_order_id: uuid.UUID
    description: str
    quantity: float
    unit_price: float
    total_price: float
    model_config = ConfigDict(from_attributes=True)


class InvoiceSchema(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID
    reference_date: date
    status: str
    total_amount: float
    due_date: date | None = None
    items: list[InvoiceItemSchema]
    model_config = ConfigDict(from_attributes=True)


@router.get("/invoices", response_model=list[InvoiceSchema])
async def list_invoices(
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    repo: Annotated[SQLAlchemyInvoiceRepository, Depends(get_invoice_repository)]
):
    """
    List all invoices for the tenant.
    """
    return await repo.list_by_tenant(tenant_id)


class GenerateBillingRequest(BaseModel):
    reference_date: date


@router.post("/generate-daily", status_code=status.HTTP_201_CREATED)
async def generate_daily_billing(
    request: GenerateBillingRequest,
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    repo: Annotated[SQLAlchemyInvoiceRepository, Depends(get_invoice_repository)]
):
    """
    Triggers the generation of daily invoices for completed ServiceOrders.
    """
    job = DailyBillingJob(session, repo, None)  # type: ignore (PricingService not fully integrated yet)
    invoice_ids = await job.execute(tenant_id, request.reference_date)
    return {"message": f"Generated {len(invoice_ids)} invoices.", "invoice_ids": invoice_ids}
