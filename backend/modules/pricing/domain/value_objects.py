from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from uuid import UUID

class PricingRuleScope(str, Enum):
    GLOBAL = "GLOBAL"
    CUSTOMER = "CUSTOMER"
    SERVICE = "SERVICE"
    REGION = "REGION"
    CONTRACT = "CONTRACT"

class PricingRuleType(str, Enum):
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT"
    ABSOLUTE_DISCOUNT = "ABSOLUTE_DISCOUNT"
    PERCENTAGE_SURCHARGE = "PERCENTAGE_SURCHARGE"
    ABSOLUTE_SURCHARGE = "ABSOLUTE_SURCHARGE"

@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "BRL"
    
    def __add__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot add money of different currencies")
        return Money(amount=self.amount + other.amount, currency=self.currency)
        
    def __sub__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot subtract money of different currencies")
        return Money(amount=self.amount - other.amount, currency=self.currency)

@dataclass(frozen=True)
class PriceCalculationResult:
    service_offering_id: UUID
    unit_of_measure_id: UUID
    quantity: Decimal
    base_unit_price: Money
    total_base_price: Money
    final_price: Money
    applied_rules_ids: List[UUID] = field(default_factory=list)
