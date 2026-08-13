import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.catalog.application.dto.requests import (
    AttachAttributeRequest,
    DefineServiceAttributeRequest,
    DraftServiceOfferingRequest,
    UpdateServiceOfferingRequest,
    RegisterUOMRequest,
    UpdateUOMRequest,
    ServiceAttributeResponse,
    ServiceOfferingResponse,
    UOMResponse,
)
from modules.catalog.application.services.catalog_service import CatalogService
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/catalog", tags=["Catalog"])

from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork

def get_catalog_service(
    session: AsyncSession = Depends(get_db_session),
    tenant_id: uuid.UUID = Depends(require_tenant)
) -> CatalogService:
    uow = SQLAlchemyUnitOfWork(session)
    repo = CatalogRepository(session)
    return CatalogService(uow, tenant_id, repo)

from modules.catalog.application.use_cases.list_catalog_entities import (
    ListServiceAttributes,
    ListServiceOfferings,
    ListUOMs,
)
from modules.catalog.application.use_cases.list_catalog_entities import (
    ServiceAttributeResponse as ListServiceAttributeResponse,
)
from modules.catalog.application.use_cases.list_catalog_entities import (
    ServiceOfferingResponse as ListServiceOfferingResponse,
)
from modules.catalog.application.use_cases.list_catalog_entities import (
    UOMResponse as ListUOMResponse,
)
from modules.catalog.infrastructure.repositories.catalog_repository import CatalogRepository


@router.get("/uom", response_model=list[ListUOMResponse])
async def list_uoms(
    tenant_id: uuid.UUID = Depends(require_tenant),
    session: AsyncSession = Depends(get_db_session)
):
    repo = CatalogRepository(session)
    return await ListUOMs(repo).execute(tenant_id)

@router.get("/attributes", response_model=list[ListServiceAttributeResponse])
async def list_attributes(
    tenant_id: uuid.UUID = Depends(require_tenant),
    session: AsyncSession = Depends(get_db_session)
):
    repo = CatalogRepository(session)
    return await ListServiceAttributes(repo).execute(tenant_id)

@router.get("/offerings", response_model=list[ListServiceOfferingResponse])
async def list_offerings(
    tenant_id: uuid.UUID = Depends(require_tenant),
    session: AsyncSession = Depends(get_db_session)
):
    repo = CatalogRepository(session)
    return await ListServiceOfferings(repo).execute(tenant_id)


@router.post("/uom", response_model=UOMResponse, status_code=status.HTTP_201_CREATED)
async def register_uom(
    request: RegisterUOMRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        uom_id = await service.register_uom(
            symbol=request.symbol,
            name=request.name,
            base_type=request.base_type
        )
        return UOMResponse(id=uom_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/uom/{uom_id}", status_code=status.HTTP_200_OK)
async def update_uom(
    uom_id: uuid.UUID,
    request: UpdateUOMRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        await service.update_uom(uom_id=uom_id, name=request.name)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/attributes", response_model=ServiceAttributeResponse, status_code=status.HTTP_201_CREATED)
async def define_attribute(
    request: DefineServiceAttributeRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        attr_id = await service.define_service_attribute(
            name=request.name,
            attribute_type=request.attribute_type,
            possible_values=request.possible_values,
            is_required=request.is_required
        )
        return ServiceAttributeResponse(id=attr_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/offerings", response_model=ServiceOfferingResponse, status_code=status.HTTP_201_CREATED)
async def draft_offering(
    request: DraftServiceOfferingRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        offering_id = await service.draft_service_offering(
            name=request.name,
            description=request.description,
            category=request.category,
            default_uom_id=request.default_uom_id,
            effective_date=request.effective_date,
            end_date=request.end_date
        )
        return ServiceOfferingResponse(id=offering_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/offerings/{offering_id}/attributes", status_code=status.HTTP_200_OK)
async def attach_attribute(
    offering_id: uuid.UUID,
    request: AttachAttributeRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        await service.attach_attribute_to_service(
            offering_id=offering_id,
            attribute_id=request.attribute_id,
            allowed_values=request.allowed_values
        )
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/offerings/{offering_id}/activate", status_code=status.HTTP_200_OK)
async def activate_offering(
    offering_id: uuid.UUID,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        await service.activate_service_offering(offering_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/offerings/{offering_id}/archive", status_code=status.HTTP_200_OK)
async def archive_offering(
    offering_id: uuid.UUID,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        await service.archive_service_offering(offering_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/offerings/{offering_id}", status_code=status.HTTP_200_OK)
async def update_offering(
    offering_id: uuid.UUID,
    request: UpdateServiceOfferingRequest,
    service: CatalogService = Depends(get_catalog_service)
):
    try:
        await service.update_service_offering(
            offering_id=offering_id,
            name=request.name,
            description=request.description,
            category=request.category,
            effective_date=request.effective_date,
            end_date=request.end_date
        )
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
