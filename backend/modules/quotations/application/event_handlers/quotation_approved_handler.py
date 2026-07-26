from shared_kernel.messaging.outbox_repository import OutboxRepository
from modules.quotations.domain.events import QuotationApproved
from modules.quotations.domain.integration_events import QuotationApprovedIntegrationEvent


class QuotationApprovedHandler:
    """
    Application Service Handler que escuta o Domain Event 'QuotationApproved'
    e converte para o Integration Event 'QuotationApprovedIntegrationEvent', 
    disparando-o para a tabela Outbox.
    """
    
    def __init__(self, outbox_repository: OutboxRepository):
        self.outbox_repository = outbox_repository
        
    async def handle(self, event: QuotationApproved) -> None:
        # Mapeia o Domain Event para o Integration Event
        integration_event = QuotationApprovedIntegrationEvent(
            quotation_id=event.quotation_id,
            company_id=event.company_id,
            tenant_id=event.tenant_id
        )
        
        # O repositório lida internamente com a serialização para a tabela outbox_events
        await self.outbox_repository.save([integration_event])
