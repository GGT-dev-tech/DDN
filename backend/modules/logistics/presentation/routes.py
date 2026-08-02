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
    vehicle_id: uuid.UUID | None = None
    driver_id: uuid.UUID | None = None
    route_id: uuid.UUID | None = None
    workflow_type: str = "WAREHOUSE_STORAGE"
    destination_id: uuid.UUID | None = None
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

class UpdateServiceOrderSchema(BaseModel):
    status: str | None = None
    workflow_type: str | None = None
    destination_id: uuid.UUID | None = None

@router.patch("/orders/{order_id}", response_model=ServiceOrderSchema)
async def update_service_order(
    order_id: uuid.UUID,
    data: UpdateServiceOrderSchema,
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)]
):
    from modules.logistics.domain.value_objects.status import ServiceOrderStatus, ServiceOrderWorkflowType
    
    stmt = (
        select(ORMServiceOrder)
        .where(ORMServiceOrder.id == order_id, ORMServiceOrder.tenant_id == tenant_id)
        .options(selectinload(ORMServiceOrder.items))
    )
    result = await session.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Service Order not found")
        
    if data.status:
        try:
            order.status = ServiceOrderStatus(data.status)
        except ValueError:
            pass
            
    if data.workflow_type:
        try:
            order.workflow_type = ServiceOrderWorkflowType(data.workflow_type)
        except ValueError:
            pass
            
    if data.destination_id is not None:
        order.destination_id = data.destination_id
        
    await session.commit()
    await session.refresh(order)
    return order
