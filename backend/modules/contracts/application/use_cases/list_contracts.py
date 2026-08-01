import uuid
from decimal import Decimal
from pydantic import BaseModel

from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository


class ContractItemResponse(BaseModel):
    id: uuid.UUID
    service_offering_id: uuid.UUID
    unit_of_measure_id: uuid.UUID
    quantity: str
    service_name: str | None = None
    final_price: str | None = None


class ContractResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    quotation_id: uuid.UUID
    status: str
    effective_date: str
    expiration_date: str | None = None
    created_at: str
    items: list[ContractItemResponse]


class ListContracts:
    def __init__(self, repository: ContractRepository):
        self.repository = repository

    async def execute(self, tenant_id: uuid.UUID) -> list[ContractResponse]:
        contracts = await self.repository.list_contracts(tenant_id)
        
        responses = []
        for c in contracts:
            items_response = []
            
            # Use current version
            for item in c.current_version.items:
                items_response.append(
                    ContractItemResponse(
                        id=item.id,
                        service_offering_id=item.service_offering_id,
                        unit_of_measure_id=item.unit_of_measure_id,
                        quantity=str(item.quantity),
                        service_name=item.snapshot.service_name if item.snapshot else None,
                        final_price=str(item.snapshot.final_price.amount) if item.snapshot else None,
                    )
                )
                
            responses.append(
                ContractResponse(
                    id=c.id,
                    company_id=c.company_id,
                    quotation_id=c.quotation_id,
                    status=c.status.value,
                    effective_date=c.terms.effective_date.isoformat() if c.terms.effective_date else "",
                    expiration_date=c.terms.expiration_date.isoformat() if c.terms.expiration_date else None,
                    created_at=c.created_at.isoformat() if c.created_at else "",
                    items=items_response
                )
            )
            
        return responses
