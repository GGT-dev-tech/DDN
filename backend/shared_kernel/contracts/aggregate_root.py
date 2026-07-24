from abc import ABC, abstractmethod
from typing import List, Any
from uuid import UUID

from shared_kernel.events.base import DomainEvent

class AggregateRoot(ABC):
    """
    Base class for all Aggregate Roots in the domain.
    Enforces that Aggregates have an ID, a Version, and manage Domain Events.
    """
    
    @property
    @abstractmethod
    def id(self) -> UUID:
        """The unique identifier of the aggregate."""
        pass
        
    @property
    @abstractmethod
    def version(self) -> int:
        """The current version of the aggregate. Used for optimistic concurrency and event sequencing."""
        pass

    def __init__(self, **kwargs: Any):
        super().__init__(**kwargs)
        self._domain_events: List[DomainEvent] = []
        
    def add_event(self, event: DomainEvent) -> None:
        """Add a domain event to the aggregate's internal collection."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        self._domain_events.append(event)
        
    def collect_events(self) -> List[DomainEvent]:
        """Return all accumulated domain events."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        return list(self._domain_events)
        
    def clear_events(self) -> None:
        """Clear all accumulated domain events."""
        self._domain_events = []
