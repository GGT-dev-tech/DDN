import re
from dataclasses import dataclass
from decimal import Decimal
from shared_kernel.value_objects.base import ValueObject
from shared_kernel.exceptions.domain import DomainException

@dataclass(frozen=True)
class LicensePlate(ValueObject):
    value: str

    def validate(self) -> None:
        # Simple validation for Mercosur / Old Brazilian license plates
        if not re.match(r'^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$', self.value):
            raise DomainException("Invalid license plate format")

@dataclass(frozen=True)
class Weight(ValueObject):
    value: Decimal
    unit: str = "kg"

    def validate(self) -> None:
        if self.value < 0:
            raise DomainException("Weight cannot be negative")
        if self.unit not in ["kg", "g", "t", "lb"]:
            raise DomainException(f"Invalid weight unit: {self.unit}")
