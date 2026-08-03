from dataclasses import dataclass
from uuid import UUID

from modules.core.domain.events import DomainEvent


@dataclass(frozen=True)
class PriceTableCreated(DomainEvent):
    price_table_id: UUID
    name: str

@dataclass(frozen=True)
class PriceTableActivated(DomainEvent):
    price_table_id: UUID
    
@dataclass(frozen=True)
class PricingRuleCreated(DomainEvent):
    pricing_rule_id: UUID
    scope: str
    rule_type: str
