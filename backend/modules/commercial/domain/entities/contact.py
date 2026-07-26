from dataclasses import dataclass
from uuid import UUID


@dataclass
class Contact:
    id: UUID
    company_id: UUID
    name: str
    email: str
    phone: str
    role: str
    is_primary: bool
