import json
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID, uuid4

from shared_kernel.events.integration import IntegrationEvent, EventMetadata
from shared_kernel.outbox.serialization.serializer import JsonEventSerializer
from shared_kernel.value_objects.finance.money import Money
from shared_kernel.value_objects.geo.location import Coordinates, GeoPoint


class RouteStatus(Enum):
    CREATED = "CREATED"
    IN_PROGRESS = "IN_PROGRESS"

@dataclass(frozen=True)
class RouteComplexEvent(IntegrationEvent):
    route_id: UUID
    price: Money
    origin: GeoPoint
    status: RouteStatus
    distance_km: Decimal

def test_json_event_serializer():
    event_id = uuid4()
    tenant_id = uuid4()
    route_id = uuid4()
    
    metadata = EventMetadata(
        event_id=event_id,
        tenant_id=tenant_id,
        correlation_id="corr-123",
        causation_id="cause-456",
        occurred_at=datetime(2026, 7, 24, 12, 0, 0, tzinfo=UTC),
        event_schema_version=1,
        aggregate_version=5
    )
    
    event = RouteComplexEvent(
        metadata=metadata,
        route_id=route_id,
        price=Money(amount=Decimal("150.50"), currency="BRL"),
        origin=GeoPoint(coordinates=Coordinates(latitude=-23.5505, longitude=-46.6333), address="SP"),
        status=RouteStatus.CREATED,
        distance_km=Decimal("42.195")
    )
    
    serializer = JsonEventSerializer()
    serialized = serializer.serialize(event)
    
    # Assert envelope structure
    assert "metadata" in serialized
    assert "payload" in serialized
    
    # Assert metadata serialization
    meta = serialized["metadata"]
    assert meta["event_id"] == str(event_id)
    assert meta["tenant_id"] == str(tenant_id)
    assert meta["correlation_id"] == "corr-123"
    assert meta["occurred_at"] == "2026-07-24T12:00:00+00:00"
    assert meta["event_schema_version"] == 1
    
    # Assert payload serialization
    payload = serialized["payload"]
    assert payload["route_id"] == str(route_id)
    assert payload["status"] == "CREATED"
    assert payload["distance_km"] == "42.195"
    assert payload["price"]["amount"] == "150.50"
    assert payload["price"]["currency"] == "BRL"
    assert payload["origin"]["coordinates"]["latitude"] == -23.5505
    
    # Ensure it's fully JSON serializable
    assert json.dumps(serialized) is not None
