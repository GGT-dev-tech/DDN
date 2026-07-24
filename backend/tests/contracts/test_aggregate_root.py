import pytest
from uuid import uuid4
from datetime import datetime, UTC
from dataclasses import dataclass

from shared_kernel.contracts.aggregate_root import AggregateRoot
from shared_kernel.events.base import DomainEvent, EventMetadata

@dataclass(frozen=True)
class DummyEvent(DomainEvent):
    some_data: str

class DummyAggregate(AggregateRoot):
    def __init__(self, id, version):
        super().__init__()
        self._id = id
        self._version = version

    @property
    def id(self):
        return self._id

    @property
    def version(self):
        return self._version
        
    def increment_version(self):
        self._version += 1

    def do_something(self):
        self.add_event(DummyEvent(
            metadata=EventMetadata(
                event_id=uuid4(),
                tenant_id=uuid4(),
                correlation_id="test",
                causation_id=None,
                occurred_at=datetime.now(UTC),
                event_schema_version=1,
                aggregate_version=self.version
            ),
            some_data="hello"
        ))
        # After successfully doing something, increment version
        self.increment_version()

def test_aggregate_root_event_collection():
    aggregate = DummyAggregate(id=uuid4(), version=1)
    
    # Do something that triggers an event
    aggregate.do_something()
    
    events = aggregate.collect_events()
    assert len(events) == 1
    assert events[0].some_data == "hello"
    
    # Version should have incremented AFTER the event was recorded with the old version
    assert aggregate.version == 2
    assert events[0].metadata.aggregate_version == 1
    
    # Clear events
    aggregate.clear_events()
    assert len(aggregate.collect_events()) == 0
