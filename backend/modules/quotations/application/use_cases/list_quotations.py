import uuid

from pydantic import BaseModel

from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository


class QuotationItemResponse(BaseModel):
    id: uuid.UUID
    service_offering_id: uuid.UUID
    unit_of_measure_id: uuid.UUID
    quantity: str
    service_name: str | None = None
    final_price: str | None = None


class QuotationResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    price_table_id: uuid.UUID | None = None
    status: str
    expires_at: str
    created_at: str
    items: list[QuotationItemResponse]


class ListQuotations:
    def __init__(self, repository: QuotationRepository):
        self.repository = repository

    async def execute(self, tenant_id: uuid.UUID) -> list[QuotationResponse]:
        quotations = await self.repository.list_quotations(tenant_id)
        
        responses = []
        for q in quotations:
            items_response = []
            for item in q.items:
                items_response.append(
                    QuotationItemResponse(
                        id=item.id,
                        service_offering_id=item.service_offering_id,
                        unit_of_measure_id=item.unit_of_measure_id,
                        quantity=str(item.quantity),
                        service_name=item.snapshot.service_name if item.snapshot else None,
                        final_price=str(item.snapshot.final_price.amount) if item.snapshot else None,
                    )
                )
                
            responses.append(
                QuotationResponse(
                    id=q.id,
                    company_id=q.company_id,
                    price_table_id=q.price_table_id,
                    status=q.status.value,
                    expires_at=q.expires_at.isoformat() if q.expires_at else "",
                    created_at=q.created_at.isoformat() if q.created_at else "",
                    items=items_response
                )
            )
            
        return responses
