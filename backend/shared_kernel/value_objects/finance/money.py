from dataclasses import dataclass
from decimal import Decimal
from shared_kernel.value_objects.base import ValueObject
from shared_kernel.exceptions.domain import DomainException

@dataclass(frozen=True)
class Money(ValueObject):
    amount: Decimal
    currency: str = "BRL"

    def validate(self) -> None:
        if self.amount < 0:
            raise DomainException("Money amount cannot be negative")
        if len(self.currency) != 3:
            raise DomainException("Currency must be a 3-letter ISO code")
