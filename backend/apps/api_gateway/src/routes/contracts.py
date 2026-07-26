from fastapi import APIRouter, Depends, HTTPException
import uuid
from typing import Dict, Any, List
from datetime import date
from pydantic import BaseModel

from database.session import get_db_session
from sqlalchemy.ext.asyncio import AsyncSession
from modules.contracts.application.services.contract_service import ContractService
from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository
from shared_kernel.outbox.repository import OutboxRepository

router = APIRouter(prefix="/contracts", tags=["Contracts"])

def get_contract_service(session: AsyncSession = Depends(get_db_session)) -> ContractService:
    repo = ContractRepository(session)
    outbox = OutboxRepository(session)
    return ContractService(session, repo, outbox)

class ContractCreateRequest(BaseModel):
    tenant_id: uuid.UUID
    company_id: uuid.UUID
    quotation_id: uuid.UUID
    effective_date: date
    items: List[Dict[str, Any]]

@router.post("", response_model=Dict[str, Any])
async def create_contract(
    request: ContractCreateRequest,
    service: ContractService = Depends(get_contract_service)
):
    try:
        contract_id = await service.create_contract(
            tenant_id=request.tenant_id,
            company_id=request.company_id,
            quotation_id=request.quotation_id,
            items_payload=request.items,
            effective_date=request.effective_date
        )
        return {"id": str(contract_id), "status": "DRAFT"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/send-for-signature")
async def send_for_signature(
    contract_id: uuid.UUID,
    service: ContractService = Depends(get_contract_service)
):
    try:
        await service.send_for_signature(contract_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{contract_id}/activate")
async def activate_contract(
    contract_id: uuid.UUID,
    service: ContractService = Depends(get_contract_service)
):
    try:
        await service.activate_contract(contract_id)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
