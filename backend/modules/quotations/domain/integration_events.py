from dataclasses import dataclass
from uuid import UUID

from shared_kernel.events.base import DomainEvent


@dataclass(frozen=True)
class QuotationApprovedIntegrationEvent(DomainEvent):
    """
    Evento de integração emitido para sinalizar que uma cotação foi formalmente aprovada.
    Este evento é isolado dos domínios internos e serve de gatilho para Contract/Billing.
    """
    quotation_id: UUID
    company_id: UUID
    tenant_id: UUID
