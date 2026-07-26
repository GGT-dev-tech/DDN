from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class EventMetadata:
    """
    Metadata describing the context in which an integration event occurred.
    Separated from the payload to keep integration events clean.
    """
    event_id: UUID
    tenant_id: UUID | None
    correlation_id: str
    causation_id: str | None
    occurred_at: datetime
    event_schema_version: int
    aggregate_version: int


@dataclass(frozen=True)
class IntegrationEvent:
    """
    Base class for all Integration Events.
    These events cross Bounded Context boundaries and are saved in the Outbox.
    Events MUST NOT contain a `payload()` method. Payload is built dynamically by the EventSerializer
    reading the child class attributes.
    """
    metadata: EventMetadata
