import uuid

from modules.quotations.application.use_cases.list_quotations import (
    QuotationItemResponse,
    QuotationResponse,
)
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository


class GetQuotation:
    def __init__(self, repository: QuotationRepository):
        self.repository = repository

    async def execute(self, tenant_id: uuid.UUID, quotation_id: uuid.UUID) -> QuotationResponse | None:
        quotation = await self.repository.get_by_id(tenant_id, quotation_id)
        if not quotation:
            return None
        
        items_response = []
        for item in quotation.items:
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
            
        return QuotationResponse(
            id=quotation.id,
            company_id=quotation.company_id,
            status=quotation.status.value,
            expires_at=quotation.expires_at.isoformat() if quotation.expires_at else "",
            created_at=quotation.created_at.isoformat() if quotation.created_at else "",
            items=items_response
        )
