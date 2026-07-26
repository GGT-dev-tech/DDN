from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.quotations.domain.events import QuotationApproved
from modules.quotations.domain.integration_events import QuotationApprovedIntegrationEvent
from shared_kernel.outbox.repository import OutboxRepository


class QuotationApprovedHandler:
    """
    Application Service Handler que escuta o Domain Event 'QuotationApproved'
    e o traduz para o Integration Event 'QuotationApprovedIntegrationEvent',
    persistindo-o na tabela Outbox.

    O EventMetadata é resolvido pela IntegrationEventFactory, que lê
    o trace_id e tenant_id do contexto de request atual (ContextVars),
    garantindo rastreabilidade sem geração arbitrária de IDs.
    """

    def __init__(
        self,
        outbox_repository: OutboxRepository,
        event_factory: IntegrationEventFactory,
    ) -> None:
        self.outbox_repository = outbox_repository
        self.event_factory = event_factory

    async def handle(self, event: QuotationApproved) -> None:
        metadata = self.event_factory.build_metadata(
            tenant_id=event.tenant_id,
            causation_id=str(event.quotation_id),
            aggregate_version=1,
        )

        integration_event = QuotationApprovedIntegrationEvent(
            metadata=metadata,
            quotation_id=event.quotation_id,
            company_id=event.company_id,
            tenant_id=event.tenant_id,
        )

        self.outbox_repository.save([integration_event])
