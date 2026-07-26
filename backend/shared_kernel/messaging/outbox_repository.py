from abc import ABC, abstractmethod
from uuid import UUID

from shared_kernel.events.base import DomainEvent


class OutboxRepository(ABC):
    @abstractmethod
    def save(self, events: list[DomainEvent]) -> None:
        """Serializes and saves domain events to the outbox table."""

    @abstractmethod
    def lock_batch(self, batch_size: int, worker_id: str) -> list[UUID]:
        """Locks a batch of pending events for processing and returns their IDs."""

    @abstractmethod
    def release_lock(self, event_id: UUID) -> None:
        """Releases the lock on an event without processing it (e.g. transient error)."""

    @abstractmethod
    def mark_processed(self, event_id: UUID) -> None:
        """Marks an event as successfully processed."""

    @abstractmethod
    def mark_failed(self, event_id: UUID, error: str) -> None:
        """Marks an event as failed (can be retried or dead-lettered)."""

    @abstractmethod
    def retry(self, event_id: UUID) -> None:
        """Resets a failed event to pending state for retry."""

    @abstractmethod
    def heartbeat(self, worker_id: str) -> None:
        """Updates the locked_at timestamp for events held by a worker to prevent lock expiration."""

    @abstractmethod
    def cleanup(self, older_than_days: int) -> int:
        """Deletes processed or expired events older than specified days."""

    @abstractmethod
    def exists(self, event_id: UUID) -> bool:
        """Checks if an event exists in the outbox."""

    @abstractmethod
    def find_by_event_id(self, event_id: UUID) -> dict | None:
        """Finds an outbox event by its ID, returning a generic dict mapping to avoid infra leakage."""
