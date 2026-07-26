import time
from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from shared_kernel.events.integration import EventMetadata
from shared_kernel.outbox.serialization.serializer import JsonEventSerializer
from tests.contracts.test_serializer import (
    Coordinates,
    GeoPoint,
    Money,
    RouteComplexEvent,
    RouteStatus,
)


def test_json_event_serializer_benchmark():
    serializer = JsonEventSerializer()
    events = []
    
    # Generate 10k events
    for i in range(10000):
        metadata = EventMetadata(
            event_id=uuid4(),
            tenant_id=uuid4(),
            correlation_id=f"corr-{i}",
            causation_id=None,
            occurred_at=datetime.now(UTC),
            event_schema_version=1,
            aggregate_version=1
        )
        
        event = RouteComplexEvent(
            metadata=metadata,
            route_id=uuid4(),
            price=Money(amount=Decimal("150.50"), currency="BRL"),
            origin=GeoPoint(coordinates=Coordinates(latitude=-23.5505, longitude=-46.6333), address="SP"),
            status=RouteStatus.CREATED,
            distance_km=Decimal("42.195")
        )
        events.append(event)
        
    start_time = time.time()
    for event in events:
        serializer.serialize(event)
    end_time = time.time()
    
    duration = end_time - start_time
    print(f"Serialized 10000 events in {duration:.4f} seconds")
    
    # Assert it takes less than 2 seconds (usually takes ~0.2s)
    assert duration < 2.0
