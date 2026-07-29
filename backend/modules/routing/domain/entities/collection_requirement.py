from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.routing.domain.value_objects import Location, Recurrence, RequirementStatus


@dataclass
class CollectionRequirement(AggregateRoot):
    """
    Represents an ongoing logistical requirement to collect waste at a specific location.
    It is agnostic to its origin (Service Plan, Contract, Manual Entry).
    """
    id: UUID
    tenant_id: UUID
    
    # Generic reference for Idempotency (UPSERT)
    origin_reference: str
    origin_item_id: str
    
    service_name: str
    
    # Logistic dimensions
    location: Location
    quantity: Decimal
    unit_of_measure: str
    
    recurrence: Recurrence
    
    status: RequirementStatus = RequirementStatus.ACTIVE
    
    # Optimistic locking
    version: int = 1
    _original_version: int = field(init=False, repr=False)
    
    def __post_init__(self):
        super().__init__()
        self._original_version = self.version

    @classmethod
    def create(
        cls,
        tenant_id: UUID,
        origin_reference: str,
        origin_item_id: str,
        service_name: str,
        location: Location,
        quantity: Decimal,
        unit_of_measure: str,
        recurrence: Recurrence,
    ) -> "CollectionRequirement":
        requirement = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            origin_reference=origin_reference,
            origin_item_id=origin_item_id,
            service_name=service_name,
            location=location,
            quantity=quantity,
            unit_of_measure=unit_of_measure,
            recurrence=recurrence,
        )
        return requirement

    def update_details(
        self,
        service_name: str,
        location: Location,
        quantity: Decimal,
        unit_of_measure: str,
        recurrence: Recurrence,
    ) -> None:
        """Called when the origin (e.g. ServicePlan) is updated."""
        self.service_name = service_name
        self.location = location
        self.quantity = quantity
        self.unit_of_measure = unit_of_measure
        self.recurrence = recurrence
        self.version += 1
        
        # In a fully event-sourced domain we would self.add_event(...)
        # but here we rely on the repository's optimistic locking.

    def deactivate(self) -> None:
        """Called when the origin is suspended, terminated, or removed."""
        if self.status != RequirementStatus.INACTIVE:
            self.status = RequirementStatus.INACTIVE
            self.version += 1
