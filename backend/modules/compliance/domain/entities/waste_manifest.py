import uuid
from datetime import UTC, date, datetime
from typing import Any

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.compliance.domain.value_objects.status import MTRStatus


class WasteItem:
    def __init__(
        self,
        id: uuid.UUID,
        waste_type: str,
        quantity: str,
        un_code: str = "",
    ):
        self.id = id
        self.waste_type = waste_type
        self.quantity = quantity
        self.un_code = un_code


class WasteManifest(AggregateRoot):
    """
    Aggregate Root for a Waste Manifest (MTR).
    Represents the documentation of waste transportation and destination.
    """
    def __init__(
        self,
        id: uuid.UUID,
        tenant_id: uuid.UUID,
        generator_company_id: uuid.UUID,
        transporter_company_id: uuid.UUID,
        service_order_id: uuid.UUID,
        issue_date: date,
        status: MTRStatus,
        items: list[WasteItem] | None = None,
        driver_name: str = "",
        vehicle_plate: str = "",
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ):
        super().__init__()
        self._id = id
        self.tenant_id = tenant_id
        self.generator_company_id = generator_company_id
        self.transporter_company_id = transporter_company_id
        self.service_order_id = service_order_id
        self.issue_date = issue_date
        self.status = status
        self.items = items or []
        self.driver_name = driver_name
        self.vehicle_plate = vehicle_plate
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)

    @property
    def id(self) -> uuid.UUID:
        return self._id

    @classmethod
    def create(
        cls,
        tenant_id: uuid.UUID,
        generator_company_id: uuid.UUID,
        transporter_company_id: uuid.UUID,
        service_order_id: uuid.UUID,
        items: list[dict[str, Any]],
        driver_name: str = "",
        vehicle_plate: str = ""
    ) -> "WasteManifest":
        manifest_items = [
            WasteItem(
                id=IdGenerator.generate(),
                waste_type=item.get("waste_type", "Resíduo Geral"),
                quantity=str(item.get("quantity", "1")),
                un_code=item.get("un_code", "")
            )
            for item in items
        ]
        
        return cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            generator_company_id=generator_company_id,
            transporter_company_id=transporter_company_id,
            service_order_id=service_order_id,
            issue_date=datetime.now(UTC).date(),
            status=MTRStatus.ISSUED,
            items=manifest_items,
            driver_name=driver_name,
            vehicle_plate=vehicle_plate
        )

    def mark_as_received(self) -> None:
        if self.status != MTRStatus.ISSUED:
            raise ValueError(f"Cannot receive manifest with status {self.status.value}")
            
        self.status = MTRStatus.RECEIVED
        self.updated_at = datetime.now(UTC)

    def cancel(self) -> None:
        if self.status == MTRStatus.RECEIVED:
            raise ValueError("Cannot cancel a received manifest")
            
        self.status = MTRStatus.CANCELED
        self.updated_at = datetime.now(UTC)
