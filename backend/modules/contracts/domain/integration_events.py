import uuid

# Integration events are also DomainEvents technically from a base class perspective 
# if they are used by outbox, but they represent public contracts.
from dataclasses import dataclass
from typing import Any

from shared_kernel.events.base import DomainEvent, EventMetadata


@dataclass(frozen=True)
class ContractActivatedIntegrationEvent(DomainEvent):
    metadata: EventMetadata
    contract_id: uuid.UUID
    tenant_id: uuid.UUID
    effective_date: str
    items: list[dict[str, Any]]
