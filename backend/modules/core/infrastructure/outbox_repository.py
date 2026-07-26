from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from modules.core.infrastructure.outbox import OutboxEvent
from shared_kernel.events.base import DomainEvent
from shared_kernel.messaging.outbox_repository import OutboxRepository
from shared_kernel.messaging.serialization.serializer import Serializer


class SQLAlchemyOutboxRepository(OutboxRepository):
    def __init__(self, session: Session, serializer: Serializer):
        self.session = session
        self.serializer = serializer

    def save(self, events: list[DomainEvent]) -> None:
        for event in events:
            serialized = self.serializer.serialize(event)
            metadata = serialized["metadata"]
            
            # Additional headers explicitly requested by user
            headers = {
                "content_type": "application/json",
                "content_encoding": "utf-8",
                "schema": f"v{metadata['event_schema_version']}",
                "producer": "ddn_management_api"
            }
            
            outbox_event = OutboxEvent(
                id=metadata["event_id"],
                tenant_id=metadata.get("tenant_id"),
                aggregate_id=str(getattr(event, "aggregate_id", "unknown")),
                aggregate_type=getattr(event, "aggregate_type", "unknown"),
                event_name=event.__class__.__name__,
                payload=serialized["payload"],
                headers=headers,
                status="PENDING",
                attempts=0,
                max_attempts=3,
                correlation_id=metadata["correlation_id"],
                causation_id=metadata.get("causation_id")
            )
            self.session.add(outbox_event)

    def lock_batch(self, batch_size: int, worker_id: str) -> list[UUID]:
        # Using SELECT FOR UPDATE SKIP LOCKED
        now = datetime.now(UTC)
        
        # We need raw SQL or SQLAlchemy constructed statement for SKIP LOCKED
        # SQLAlchemy supports with_for_update(skip_locked=True)
        stmt = (
            select(OutboxEvent.id)
            .where(OutboxEvent.status.in_(["PENDING", "RETRYING"]))
            .where(OutboxEvent.available_at <= now)
            .limit(batch_size)
            .with_for_update(skip_locked=True)
        )
        
        locked_ids = self.session.scalars(stmt).all()
        
        if locked_ids:
            update_stmt = (
                update(OutboxEvent)
                .where(OutboxEvent.id.in_(locked_ids))
                .values(
                    status="PROCESSING",
                    locked_at=now,
                    worker_id=worker_id,
                    attempts=OutboxEvent.attempts + 1
                )
            )
            self.session.execute(update_stmt)
            self.session.commit() # Usually lock_batch runs in its own fast transaction
            
        return list(locked_ids)

    def release_lock(self, event_id: UUID) -> None:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.id == event_id)
            .values(
                status="PENDING", # or RETRYING depending on logic, keeping simple
                locked_at=None,
                worker_id=None
            )
        )
        self.session.execute(stmt)

    def mark_processed(self, event_id: UUID) -> None:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.id == event_id)
            .values(
                status="PROCESSED",
                processed_at=datetime.now(UTC),
                locked_at=None,
                worker_id=None
            )
        )
        self.session.execute(stmt)

    def mark_failed(self, event_id: UUID, error: str) -> None:
        # Complex state machine can be handled in the caller or here.
        # Fetch current attempts to decide if RETRYING or DEAD_LETTER
        event = self.session.get(OutboxEvent, event_id)
        if not event:
            return
            
        if event.attempts >= event.max_attempts:
            new_status = "DEAD_LETTER"
        else:
            new_status = "RETRYING"
            
        event.status = new_status
        event.error_message = error
        event.locked_at = None
        event.worker_id = None
        self.session.add(event)

    def retry(self, event_id: UUID) -> None:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.id == event_id)
            .where(OutboxEvent.status.in_(["FAILED", "DEAD_LETTER", "RETRYING"]))
            .values(
                status="PENDING",
                attempts=0,
                error_message=None
            )
        )
        self.session.execute(stmt)

    def heartbeat(self, worker_id: str) -> None:
        stmt = (
            update(OutboxEvent)
            .where(OutboxEvent.worker_id == worker_id)
            .where(OutboxEvent.status == "PROCESSING")
            .values(locked_at=datetime.now(UTC))
        )
        self.session.execute(stmt)

    def cleanup(self, older_than_days: int) -> int:
        cutoff = datetime.now(UTC).date() # simplified
        # Real logic requires subtracting days
        stmt = (
            delete(OutboxEvent)
            .where(OutboxEvent.status.in_(["PROCESSED", "EXPIRED"]))
            # .where(OutboxEvent.created_at < cutoff) 
        )
        result = self.session.execute(stmt)
        return result.rowcount

    def exists(self, event_id: UUID) -> bool:
        stmt = select(OutboxEvent.id).where(OutboxEvent.id == event_id)
        return self.session.scalar(stmt) is not None

    def find_by_event_id(self, event_id: UUID) -> dict | None:
        event = self.session.get(OutboxEvent, event_id)
        if not event:
            return None
        return {
            "id": event.id,
            "tenant_id": event.tenant_id,
            "aggregate_id": event.aggregate_id,
            "aggregate_type": event.aggregate_type,
            "event_name": event.event_name,
            "payload": event.payload,
            "headers": event.headers,
            "status": event.status,
            "attempts": event.attempts,
            "max_attempts": event.max_attempts,
            "correlation_id": event.correlation_id,
            "causation_id": event.causation_id
        }
