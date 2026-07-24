from dataclasses import dataclass
from decimal import Decimal
from shared_kernel.value_objects.base import ValueObject
from shared_kernel.exceptions.domain import DomainException

@dataclass(frozen=True)
class Distance(ValueObject):
    value: Decimal
    unit: str = "km"

    def validate(self) -> None:
        if self.value < 0:
            raise DomainException("Distance cannot be negative")
        if self.unit not in ["km", "m", "mi"]:
            raise DomainException(f"Invalid distance unit: {self.unit}")

@dataclass(frozen=True)
class Duration(ValueObject):
    value: int # typically seconds or minutes
    unit: str = "seconds"

    def validate(self) -> None:
        if self.value < 0:
            raise DomainException("Duration cannot be negative")
        if self.unit not in ["seconds", "minutes", "hours", "days"]:
            raise DomainException(f"Invalid duration unit: {self.unit}")
