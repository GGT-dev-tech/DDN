import re
from dataclasses import dataclass
from shared_kernel.value_objects.base import ValueObject
from shared_kernel.exceptions.domain import DomainException

@dataclass(frozen=True)
class Email(ValueObject):
    value: str

    def validate(self) -> None:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", self.value):
            raise DomainException("Invalid email format")

@dataclass(frozen=True)
class Phone(ValueObject):
    value: str

    def validate(self) -> None:
        # Simple E.164-ish validation
        if not re.match(r"^\+?[1-9]\d{1,14}$", self.value):
            raise DomainException("Invalid phone number format")
