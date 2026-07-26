from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID


class QuotationStatus(Enum):
    DRAFT = "DRAFT"
    PRICED = "PRICED"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "BRL"


@dataclass(frozen=True)
class QuotationItemSnapshot:
    """
    Imutável snapshot que guarda o resultado do Pricing Engine
    e os dados atrelados do Catalog naquele exato milissegundo.
    """
    service_name: str
    unit_name: str
    base_unit_price: Money
    total_base_price: Money
    surcharges_total: Money
    discounts_total: Money
    final_price: Money
    pricing_reference: Optional[str] = None # ID de regras ou justificativas do motor
