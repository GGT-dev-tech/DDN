import uuid
from datetime import UTC, datetime

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.facilities.domain.value_objects import Address, DestinationType

class Destination(AggregateRoot):
    def __init__(
        self,
        tenant_id: uuid.UUID,
        name: str,
        type: DestinationType,
        address: Address,
        is_active: bool = True,
        contact_name: str | None = None,
        contact_phone: str | None = None,
        id: uuid.UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self.tenant_id = tenant_id
        self.name = name
        self.type = type
        self.address = address
        self.is_active = is_active
        self.contact_name = contact_name
        self.contact_phone = contact_phone
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)

    @property
    def id(self) -> uuid.UUID:
        return self._id

    def update(
        self,
        name: str,
        type: DestinationType,
        address: Address,
        contact_name: str | None = None,
        contact_phone: str | None = None,
    ) -> None:
        self.name = name
        self.type = type
        self.address = address
        self.contact_name = contact_name
        self.contact_phone = contact_phone
        self.updated_at = datetime.now(UTC)

    def deactivate(self) -> None:
        self.is_active = False
        self.updated_at = datetime.now(UTC)

    def activate(self) -> None:
        self.is_active = True
        self.updated_at = datetime.now(UTC)
