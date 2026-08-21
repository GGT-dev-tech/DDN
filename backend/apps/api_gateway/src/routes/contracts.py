import uuid
from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.contracts.application.services.contract_service import ContractService
from modules.contracts.features.activate_contract.handler import (
    ActivateContractCommand,
    ActivateContractHandler,
)
from modules.contracts.features.list_contracts.handler import ListContractsQueryHandler
from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository
from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
from modules.identity.authorization import require_role
from modules.identity.dependencies import require_tenant
from modules.tenant.domain.entities.tenant_user import TenantRole
from shared_kernel.outbox.repository import OutboxRepository

router = APIRouter(prefix="/contracts", tags=["Contracts"])


def get_contract_service(session: AsyncSession = Depends(get_db_session)) -> ContractService:
    repo = ContractRepository(session)
    outbox = OutboxRepository(session)
    return ContractService(session, repo, outbox)

@router.get("")
async def list_contracts(
    tenant_id: uuid.UUID = Depends(require_tenant),
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db_session)
):
    handler = ListContractsQueryHandler(session)
    return await handler.handle(tenant_id, skip=skip, limit=limit)

class ContractCreateRequest(BaseModel):
    company_id: uuid.UUID
    quotation_id: uuid.UUID
    effective_date: date
    mtr_id: uuid.UUID | None = None
    destination_id: uuid.UUID | None = None
    auto_generate_service_orders: bool = False
    items: list[dict[str, Any]]


@router.post("", response_model=dict[str, Any])
async def create_contract(
    request: ContractCreateRequest,
    tenant_id: uuid.UUID = Depends(require_tenant),  # tenant always from JWT, never from body
    _rbac: None = require_role(TenantRole.ADMIN),
    service: ContractService = Depends(get_contract_service)
):
    try:
        contract_id = await service.create_contract(
            tenant_id=tenant_id,
            company_id=request.company_id,
            quotation_id=request.quotation_id,
            effective_date=request.effective_date,
            items_payload=request.items,
            mtr_id=request.mtr_id,
            destination_id=request.destination_id,
            auto_generate_service_orders=request.auto_generate_service_orders
        )
        return {"id": str(contract_id), "status": "DRAFT"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/send-for-signature")
async def send_for_signature(
    contract_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(require_tenant),
    _rbac: None = require_role(TenantRole.ADMIN),
    service: ContractService = Depends(get_contract_service)
):
    # Added require_tenant to fix IDOR
    try:
        await service.send_for_signature(contract_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{contract_id}/activate")
async def activate_contract(
    contract_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(require_tenant),
    _rbac: None = require_role(TenantRole.OWNER),
    session: AsyncSession = Depends(get_db_session)
):
    from modules.core.infrastructure.outbox_repository import SQLAlchemyOutboxRepository
    from shared_kernel.outbox.serialization.serializer import StandardJSONSerializer
    
    # Vertical Slice!
    outbox_repo = SQLAlchemyOutboxRepository(session, StandardJSONSerializer())
    uow = SQLAlchemyUnitOfWork(session, outbox_repository=outbox_repo)
    repo = ContractRepository(session)
    event_factory = IntegrationEventFactory()
    
    handler = ActivateContractHandler(uow, repo, event_factory)
    command = ActivateContractCommand(contract_id=contract_id, tenant_id=tenant_id)
    
    try:
        await handler.handle(command)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
