from enum import Enum
from pydantic import BaseModel

class DestinationType(str, Enum):
    DDN_BASE = "DDN_BASE"
    LANDFILL = "LANDFILL"
    RECYCLING_CENTER = "RECYCLING_CENTER"
    TREATMENT_PLANT = "TREATMENT_PLANT"
    OTHER = "OTHER"

class Address(BaseModel):
    street: str
    number: str
    complement: str | None = None
    neighborhood: str
    city: str
    state: str
    zip_code: str
    latitude: float | None = None
    longitude: float | None = None
