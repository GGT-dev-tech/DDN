from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from shared_kernel.events.base import DomainEvent

class OutboxRepository(ABC):
    @abstractmethod
    def save(self, events: List[DomainEvent]) -> None:
        """Serializes and saves domain events to the outbox table."""
        pass

    @abstractmethod
    def lock_batch(self, batch_size: int, worker_id: str) -> List[UUID]:
        """Locks a batch of pending events for processing and returns their IDs."""
        pass

    @abstractmethod
    def release_lock(self, event_id: UUID) -> None:
        """Releases the lock on an event without processing it (e.g. transient error)."""
        pass

    @abstractmethod
    def mark_processed(self, event_id: UUID) -> None:
        """Marks an event as successfully processed."""
        pass

    @abstractmethod
    def mark_failed(self, event_id: UUID, error: str) -> None:
        """Marks an event as failed (can be retried or dead-lettered)."""
        pass

    @abstractmethod
    def retry(self, event_id: UUID) -> None:
        """Resets a failed event to pending state for retry."""
        pass

    @abstractmethod
    def heartbeat(self, worker_id: str) -> None:
        """Updates the locked_at timestamp for events held by a worker to prevent lock expiration."""
        pass

    @abstractmethod
    def cleanup(self, older_than_days: int) -> int:
        """Deletes processed or expired events older than specified days."""
        pass

    @abstractmethod
    def exists(self, event_id: UUID) -> bool:
        """Checks if an event exists in the outbox."""
        pass

    @abstractmethod
    def find_by_event_id(self, event_id: UUID) -> Optional[dict]:
        """Finds an outbox event by its ID, returning a generic dict mapping to avoid infra leakage."""
        pass
