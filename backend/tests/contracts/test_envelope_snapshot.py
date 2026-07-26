import json
import os
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from shared_kernel.events.base import EventMetadata
from shared_kernel.messaging.serialization.serializer import JsonEventSerializer
from tests.contracts.test_serializer import (
    Coordinates,
    GeoPoint,
    Money,
    RouteComplexEvent,
    RouteStatus,
)

SNAPSHOT_FILE = os.path.join(os.path.dirname(__file__), "..", "architecture", "snapshots", "envelope_v1.json")

def test_event_envelope_snapshot():
    # Use deterministic UUIDs and timestamps for the snapshot
    event_id = UUID("00000000-0000-0000-0000-000000000001")
    tenant_id = UUID("00000000-0000-0000-0000-000000000002")
    route_id = UUID("00000000-0000-0000-0000-000000000003")
    occurred_at = datetime(2026, 7, 24, 12, 0, 0, tzinfo=UTC)
    
    metadata = EventMetadata(
        event_id=event_id,
        tenant_id=tenant_id,
        correlation_id="corr-123",
        causation_id="cause-456",
        occurred_at=occurred_at,
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
    
    # Save or compare with snapshot
    if os.environ.get("UPDATE_SNAPSHOTS") == "1" or not os.path.exists(SNAPSHOT_FILE):
        os.makedirs(os.path.dirname(SNAPSHOT_FILE), exist_ok=True)
        with open(SNAPSHOT_FILE, "w") as f:
            json.dump(serialized, f, indent=2)
    else:
        with open(SNAPSHOT_FILE, "r") as f:
            snapshot = json.load(f)
        
        # Compare
        assert serialized == snapshot, "Event envelope serialization does not match snapshot. This breaks contract! Run with UPDATE_SNAPSHOTS=1 if intentional."
