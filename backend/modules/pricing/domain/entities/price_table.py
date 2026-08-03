from datetime import date
from uuid import UUID

from modules.core.domain.id_generator import IdGenerator
from modules.pricing.domain.events import PriceTableActivated, PriceTableCreated
from modules.pricing.domain.value_objects import Money
from shared_kernel.contracts.aggregate_root import AggregateRoot


class PriceTableItem:
    def __init__(
        self,
        service_offering_id: UUID,
        unit_of_measure_id: UUID,
        unit_price: Money,
        id: UUID | None = None
    ):
        self.id = id or IdGenerator.generate()
        self.service_offering_id = service_offering_id
        self.unit_of_measure_id = unit_of_measure_id
        self.unit_price = unit_price

class PriceTable(AggregateRoot):
    def __init__(
        self,
        name: str,
        effective_date: date,
        end_date: date | None = None,
        region_id: UUID | None = None,
        customer_id: UUID | None = None,
        id: UUID | None = None,
        is_active: bool = False
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self._version = 1
        self.name = name
        self.effective_date = effective_date
        self.end_date = end_date
        self.region_id = region_id
        self.customer_id = customer_id
        self.is_active = is_active
        self._items: list[PriceTableItem] = []
        
        self.validate()
        if not id:
            self.add_event(PriceTableCreated(price_table_id=self.id, name=self.name))
            
    @property
    def id(self) -> UUID:
        return self._id
        
    @property
    def version(self) -> int:
        return self._version

    def validate(self):
        if self.end_date and self.end_date <= self.effective_date:
            raise ValueError("end_date must be greater than effective_date")
            
    def activate(self):
        if self.is_active:
            raise ValueError("Price table is already active")
        self.is_active = True
        self._version += 1
        self.add_event(PriceTableActivated(price_table_id=self.id))
        
    def add_item(self, service_offering_id: UUID, unit_of_measure_id: UUID, unit_price: Money) -> PriceTableItem:
        # Check for duplication (same service + uom)
        for item in self._items:
            if item.service_offering_id == service_offering_id and item.unit_of_measure_id == unit_of_measure_id:
                raise ValueError("PriceTableItem already exists for this service and UOM")
                
        item = PriceTableItem(
            service_offering_id=service_offering_id,
            unit_of_measure_id=unit_of_measure_id,
            unit_price=unit_price
        )
        self._items.append(item)
        self._version += 1
        return item
        
    @property
    def items(self) -> list[PriceTableItem]:
        return list(self._items)
