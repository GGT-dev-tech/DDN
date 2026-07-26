from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any
from uuid import UUID

from .id_generator import IdGenerator


@dataclass(frozen=True)
class DomainEvent:
    """
    Base class for all Domain Events.
    Must be pure and not contain any infrastructure metadata.
    """

@dataclass(frozen=True)
class EventMetadata:
    trace_id: str
    request_id: UUID
    tenant_id: UUID | None
    user_id: UUID | None
    session_id: UUID | None

@dataclass(frozen=True)
class EventEnvelope:
    id: UUID
    name: str
    version: int
    occurred_at: datetime
    metadata: EventMetadata
    payload: dict[str, Any]

class EventEnvelopeFactory:
    """
    Factory to wrap a pure DomainEvent into an EventEnvelope using the current Context.
    """
    def __init__(self, context_accessor):
        self.context_accessor = context_accessor

    def create(self, event: DomainEvent, version: int = 1) -> EventEnvelope:
        tenant_ctx = self.context_accessor.tenant()
        auth_ctx = self.context_accessor.auth()
        req_ctx = self.context_accessor.request()
        
        metadata = EventMetadata(
            trace_id=req_ctx.trace_id if req_ctx else "unknown",
            request_id=req_ctx.request_id if req_ctx else IdGenerator.generate(),
            tenant_id=tenant_ctx.tenant_id if tenant_ctx else None,
            user_id=auth_ctx.user_id if auth_ctx else None,
            session_id=auth_ctx.session_id if auth_ctx else None,
        )
        
        return EventEnvelope(
            id=IdGenerator.generate(),
            name=event.__class__.__name__,
            version=version,
            occurred_at=datetime.now(datetime.UTC),
            metadata=metadata,
            payload=asdict(event)
        )
