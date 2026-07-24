from dataclasses import dataclass
from shared_kernel.value_objects.base import ValueObject
from shared_kernel.exceptions.domain import DomainException

@dataclass(frozen=True)
class Coordinates(ValueObject):
    latitude: float
    longitude: float

    def validate(self) -> None:
        if not (-90 <= self.latitude <= 90):
            raise DomainException("Latitude must be between -90 and 90")
        if not (-180 <= self.longitude <= 180):
            raise DomainException("Longitude must be between -180 and 180")

@dataclass(frozen=True)
class GeoPoint(ValueObject):
    coordinates: Coordinates
    address: str = ""

    def validate(self) -> None:
        pass
