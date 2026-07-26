import uuid
from dataclasses import dataclass

from modules.core.domain.events import DomainEvent


@dataclass(frozen=True)
class ContractCreated(DomainEvent):
    contract_id: uuid.UUID
    tenant_id: uuid.UUID

@dataclass(frozen=True)
class ContractStatusChanged(DomainEvent):
    contract_id: uuid.UUID
    tenant_id: uuid.UUID
    new_status: str
