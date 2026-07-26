from abc import ABC, abstractmethod
from typing import Any, Protocol, runtime_checkable
from uuid import UUID


@runtime_checkable
class DomainEventProtocol(Protocol):
    pass
    # We can enforce properties like occurred_at if needed, but for now just a marker interface

class AggregateRoot(ABC):
    """
    Base class for all Aggregate Roots in the domain.
    Enforces that Aggregates have an ID, a Version, and manage Domain Events.
    """
    
    @property
    @abstractmethod
    def id(self) -> UUID:
        """The unique identifier of the aggregate."""
        
    @property
    @abstractmethod
    def version(self) -> int:
        """The current version of the aggregate. Used for optimistic concurrency and event sequencing."""

    def __init__(self, **kwargs: Any):
        super().__init__(**kwargs)
        self._domain_events: list[DomainEventProtocol] = []
        
    def add_event(self, event: DomainEventProtocol) -> None:
        """Add a domain event to the aggregate's internal collection."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        self._domain_events.append(event)
        
    def collect_events(self) -> list[DomainEventProtocol]:
        """Return all accumulated domain events."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        return list(self._domain_events)
        
    def clear_events(self) -> None:
        """Clear all accumulated domain events."""
        self._domain_events = []
