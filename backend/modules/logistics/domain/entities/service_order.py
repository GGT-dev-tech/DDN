import uuid
from datetime import UTC, date, datetime
from typing import Any

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.logistics.domain.value_objects.status import (
    ServiceOrderStatus,
    ServiceOrderWorkflowType,
)


class ServiceOrderItem:
    def __init__(
        self,
        id: uuid.UUID,
        service_offering_id: uuid.UUID,
        quantity: str,
        service_name: str = "",
    ):
        self.id = id
        self.service_offering_id = service_offering_id
        self.quantity = quantity
        self.service_name = service_name


class ServiceOrder(AggregateRoot):
    """
    Aggregate Root for a Service Order (OS).
    Represents an actionable operational task derived from a Service Plan for a specific day.
    """
    def __init__(
        self,
        id: uuid.UUID,
        tenant_id: uuid.UUID,
        service_plan_id: uuid.UUID,
        company_id: uuid.UUID,
        scheduled_date: date,
        status: ServiceOrderStatus,
        workflow_type: ServiceOrderWorkflowType = ServiceOrderWorkflowType.WAREHOUSE_STORAGE,
        items: list[ServiceOrderItem] | None = None,
        vehicle_id: uuid.UUID | None = None,
        driver_id: uuid.UUID | None = None,
        route_id: uuid.UUID | None = None,
        destination_id: uuid.UUID | None = None,
        completed_at: datetime | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        super().__init__()
        self._id = id
        self.tenant_id = tenant_id
        self.service_plan_id = service_plan_id
        self.company_id = company_id
        self.scheduled_date = scheduled_date
        self.status = status
        self.workflow_type = workflow_type
        self.items = items or []
        self.vehicle_id = vehicle_id
        self.driver_id = driver_id
        self.route_id = route_id
        self.destination_id = destination_id
        self.completed_at = completed_at
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)

    @property
    def id(self) -> uuid.UUID:
        return self._id

    @classmethod
    def create(
        cls,
        tenant_id: uuid.UUID,
        service_plan_id: uuid.UUID,
        company_id: uuid.UUID,
        scheduled_date: date,
        items: list[dict[str, Any]]
    ) -> "ServiceOrder":
        order_items = [
            ServiceOrderItem(
                id=IdGenerator.generate(),
                service_offering_id=uuid.UUID(str(item["service_offering_id"])),
                service_name=item.get("service_name", ""),
                quantity=str(item.get("quantity", "1")),
            )
            for item in items
        ]
        
        return cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            service_plan_id=service_plan_id,
            company_id=company_id,
            scheduled_date=scheduled_date,
            status=ServiceOrderStatus.PENDING,
            workflow_type=ServiceOrderWorkflowType.WAREHOUSE_STORAGE,
            items=order_items,
            destination_id=None
        )

    def mark_as_scheduled(self, route_id: uuid.UUID, vehicle_id: uuid.UUID | None = None, driver_id: uuid.UUID | None = None) -> None:
        if self.status not in (ServiceOrderStatus.PENDING, ServiceOrderStatus.SCHEDULED):
            raise ValueError(f"Cannot schedule ServiceOrder with status {self.status.value}")
            
        self.status = ServiceOrderStatus.SCHEDULED
        self.route_id = route_id
        if vehicle_id:
            self.vehicle_id = vehicle_id
        if driver_id:
            self.driver_id = driver_id
        self.updated_at = datetime.now(UTC)

    def complete(self) -> None:
        if self.status != ServiceOrderStatus.SCHEDULED and self.status != ServiceOrderStatus.IN_PROGRESS:
            raise ValueError(f"Cannot complete ServiceOrder with status {self.status.value}")
            
        self.status = ServiceOrderStatus.COMPLETED
        self.completed_at = datetime.now(UTC)
        self.updated_at = self.completed_at

    def cancel(self) -> None:
        if self.status == ServiceOrderStatus.COMPLETED:
            raise ValueError("Cannot cancel a completed ServiceOrder")
            
        self.status = ServiceOrderStatus.CANCELED
        self.updated_at = datetime.now(UTC)
