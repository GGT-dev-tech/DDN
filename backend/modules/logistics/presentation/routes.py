import uuid
from datetime import date
from typing import Annotated, Sequence

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, ConfigDict

from database.session import get_db_session
from modules.identity.dependencies import require_tenant
from modules.logistics.infrastructure.orm_models import ORMServiceOrder
from modules.logistics.infrastructure.tasks import generate_daily_service_orders_task

router = APIRouter(prefix="/logistics", tags=["Logistics"])

class ServiceOrderItemSchema(BaseModel):
    id: uuid.UUID
    service_offering_id: uuid.UUID
    service_name: str
    quantity: str
    model_config = ConfigDict(from_attributes=True)

class ServiceOrderSchema(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    service_plan_id: uuid.UUID
    company_id: uuid.UUID
    scheduled_date: date
    status: str
    vehicle_id: uuid.UUID | None
    driver_id: uuid.UUID | None
    route_id: uuid.UUID | None
    items: list[ServiceOrderItemSchema]
    model_config = ConfigDict(from_attributes=True)

@router.get("/orders", response_model=list[ServiceOrderSchema])
async def list_service_orders(
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    scheduled_date: date | None = Query(None, description="Filter by scheduled date"),
    status: str | None = Query(None, description="Filter by status")
):
    stmt = (
        select(ORMServiceOrder)
        .where(ORMServiceOrder.tenant_id == tenant_id)
        .options(selectinload(ORMServiceOrder.items))
    )
    
    if scheduled_date:
        stmt = stmt.where(ORMServiceOrder.scheduled_date == scheduled_date)
    if status:
        stmt = stmt.where(ORMServiceOrder.status == status)
        
    result = await session.execute(stmt)
    orders = result.scalars().all()
    return orders

@router.post("/orders/generate-daily")
async def trigger_generate_daily_orders():
    """
    Manually triggers the background task to generate daily orders.
    Useful for testing or if the cron job fails.
    """
    task = generate_daily_service_orders_task.delay()
    return {"message": "Task triggered", "task_id": task.id}
