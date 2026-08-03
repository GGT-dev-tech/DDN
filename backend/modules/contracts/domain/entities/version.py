import uuid
from datetime import UTC, datetime
from decimal import Decimal

from modules.contracts.domain.value_objects import ContractItemSnapshot
from modules.core.domain.id_generator import IdGenerator


class ContractItem:
    def __init__(
        self,
        service_offering_id: uuid.UUID,
        unit_of_measure_id: uuid.UUID,
        quantity: Decimal,
        snapshot: ContractItemSnapshot,
        id: uuid.UUID | None = None
    ):
        self.id = id or IdGenerator.generate()
        self.service_offering_id = service_offering_id
        self.unit_of_measure_id = unit_of_measure_id
        self.quantity = quantity
        self.snapshot = snapshot


class ContractVersion:
    def __init__(
        self,
        version_number: int,
        id: uuid.UUID | None = None,
        created_at: datetime | None = None
    ):
        self.id = id or IdGenerator.generate()
        self.version_number = version_number
        self.created_at = created_at or datetime.now(UTC)
        self.items: list[ContractItem] = []

    def add_item(
        self, 
        service_offering_id: uuid.UUID, 
        unit_of_measure_id: uuid.UUID, 
        quantity: Decimal, 
        snapshot: ContractItemSnapshot
    ) -> ContractItem:
        item = ContractItem(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            quantity=quantity,
            snapshot=snapshot
        )
        self.items.append(item)
        return item
