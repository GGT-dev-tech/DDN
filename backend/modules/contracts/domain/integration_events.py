import uuid

# Integration events are also DomainEvents technically from a base class perspective 
# if they are used by outbox, but they represent public contracts.
from dataclasses import dataclass
from typing import Any

from shared_kernel.events.integration import EventMetadata, IntegrationEvent


@dataclass(frozen=True)
class ContractActivatedIntegrationEvent(IntegrationEvent):
    metadata: EventMetadata
    contract_id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID           # enriched for Service Plan BC
    effective_date: str
    expiration_date: str | None     # from ContractTerm.expiration_date
    items: list[dict[str, Any]]

