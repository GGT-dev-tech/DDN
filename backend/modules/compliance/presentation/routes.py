import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.session import get_db_session
from modules.compliance.domain.entities.waste_manifest import WasteManifest
from modules.compliance.infrastructure.orm_models import ORMWasteManifest
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class WasteItemSchema(BaseModel):
    id: uuid.UUID
    waste_type: str
    quantity: str
    un_code: str
    model_config = ConfigDict(from_attributes=True)

class WasteManifestSchema(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    generator_company_id: uuid.UUID
    transporter_company_id: uuid.UUID
    service_order_id: uuid.UUID
    issue_date: date
    status: str
    driver_name: str
    vehicle_plate: str
    items: list[WasteItemSchema]
    model_config = ConfigDict(from_attributes=True)

@router.get("/mtrs", response_model=list[WasteManifestSchema])
async def list_mtrs(
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    issue_date: date | None = Query(None, description="Filter by issue date"),
    status: str | None = Query(None, description="Filter by status")
):
    stmt = (
        select(ORMWasteManifest)
        .where(ORMWasteManifest.tenant_id == tenant_id)
        .options(selectinload(ORMWasteManifest.items))
    )
    
    if issue_date:
        stmt = stmt.where(ORMWasteManifest.issue_date == issue_date)
    if status:
        stmt = stmt.where(ORMWasteManifest.status == status)
        
    result = await session.execute(stmt)
    mtrs = result.scalars().all()
    return mtrs

@router.post("/mtrs/{service_order_id}/generate", response_model=WasteManifestSchema)
async def generate_mtr_for_order(
    service_order_id: uuid.UUID,
    tenant_id: Annotated[uuid.UUID, Depends(require_tenant)],
    session: Annotated[AsyncSession, Depends(get_db_session)]
):
    from modules.logistics.infrastructure.orm_models import ORMServiceOrder
    
    # 1. Fetch the service order
    stmt = (
        select(ORMServiceOrder)
        .where(ORMServiceOrder.id == service_order_id, ORMServiceOrder.tenant_id == tenant_id)
        .options(selectinload(ORMServiceOrder.items))
    )
    result = await session.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Service Order not found")
        
    # 2. Check if MTR already exists
    existing_stmt = select(ORMWasteManifest).where(ORMWasteManifest.service_order_id == service_order_id)
    existing_result = await session.execute(existing_stmt)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="MTR already exists for this Service Order")
        
    # 3. Create Manifest via domain entity
    items = [{"waste_type": item.service_name, "quantity": item.quantity, "un_code": ""} for item in order.items]
    
    # Using the same company for transport for simplicity in this MVP
    manifest_entity = WasteManifest.create(
        tenant_id=tenant_id,
        generator_company_id=order.company_id,
        transporter_company_id=tenant_id,  # Assume tenant is the transporter
        service_order_id=order.id,
        items=items,
    )
    
    # 4. Map to ORM and save
    from modules.compliance.infrastructure.orm_models import ORMWasteItem
    orm_items = [
        ORMWasteItem(
            id=item.id,
            manifest_id=manifest_entity.id,
            waste_type=item.waste_type,
            quantity=item.quantity,
            un_code=item.un_code
        ) for item in manifest_entity.items
    ]
    
    orm_manifest = ORMWasteManifest(
        id=manifest_entity.id,
        tenant_id=manifest_entity.tenant_id,
        generator_company_id=manifest_entity.generator_company_id,
        transporter_company_id=manifest_entity.transporter_company_id,
        service_order_id=manifest_entity.service_order_id,
        issue_date=manifest_entity.issue_date,
        status=manifest_entity.status,
        driver_name=manifest_entity.driver_name,
        vehicle_plate=manifest_entity.vehicle_plate,
        created_at=manifest_entity.created_at,
        updated_at=manifest_entity.updated_at,
        items=orm_items
    )
    
    session.add(orm_manifest)
    await session.commit()
    await session.refresh(orm_manifest)
    
    return orm_manifest
