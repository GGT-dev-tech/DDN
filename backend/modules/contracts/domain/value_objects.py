from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from enum import Enum


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    WAITING_SIGNATURE = "WAITING_SIGNATURE"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

@dataclass(frozen=True)
class ContractTerm:
    effective_date: date
    expiration_date: date | None
    renewal_rule: str | None = None
    adjustment_rule: str | None = None

@dataclass(frozen=True)
class ContractItemSnapshot:
    service_name: str
    unit_name: str
    base_unit_price: Money
    total_base_price: Money
    surcharges_total: Money
    discounts_total: Money
    final_price: Money
    pricing_reference: str | None = None
