from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.identity.dependencies import require_tenant
from modules.facilities.application.dto.destination_dto import (
    CreateDestinationRequest,
    UpdateDestinationRequest,
    DestinationResponse
)
from modules.facilities.application.use_cases.destination_use_cases import DestinationUseCases
from modules.facilities.infrastructure.repositories.destination_repository import SQLDestinationRepository

router = APIRouter(prefix="/facilities/destinations", tags=["Facilities"])

def get_destination_use_cases(session: AsyncSession = Depends(get_db_session)) -> DestinationUseCases:
    from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
    uow = SQLAlchemyUnitOfWork(session)
    repo = SQLDestinationRepository(session)
    return DestinationUseCases(uow, repo)

@router.post("", response_model=DestinationResponse)
def create_destination(
    request: CreateDestinationRequest,
    tenant_id: UUID = Depends(require_tenant),
    use_cases: DestinationUseCases = Depends(get_destination_use_cases)
):
    try:
        return use_cases.create(tenant_id, request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[DestinationResponse])
def list_destinations(
    active_only: bool = True,
    tenant_id: UUID = Depends(require_tenant),
    use_cases: DestinationUseCases = Depends(get_destination_use_cases)
):
    try:
        return use_cases.list_all(tenant_id, active_only)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{destination_id}", response_model=DestinationResponse)
def get_destination(
    destination_id: UUID,
    tenant_id: UUID = Depends(require_tenant),
    use_cases: DestinationUseCases = Depends(get_destination_use_cases)
):
    try:
        return use_cases.get(destination_id, tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{destination_id}", response_model=DestinationResponse)
def update_destination(
    destination_id: UUID,
    request: UpdateDestinationRequest,
    tenant_id: UUID = Depends(require_tenant),
    use_cases: DestinationUseCases = Depends(get_destination_use_cases)
):
    try:
        return use_cases.update(destination_id, tenant_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{destination_id}/toggle", response_model=DestinationResponse)
def toggle_destination(
    destination_id: UUID,
    activate: bool,
    tenant_id: UUID = Depends(require_tenant),
    use_cases: DestinationUseCases = Depends(get_destination_use_cases)
):
    try:
        return use_cases.toggle_active(destination_id, tenant_id, activate)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
