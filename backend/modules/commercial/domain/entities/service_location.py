from dataclasses import dataclass
from uuid import UUID


@dataclass
class ServiceLocation:
    id: UUID
    company_id: UUID
    address_line: str
    city: str
    state: str
    zip_code: str
    coordinates: str | None  # e.g. "lat,lng" or PostGIS format
    operating_hours: str | None
    access_notes: str | None
    is_main: bool
