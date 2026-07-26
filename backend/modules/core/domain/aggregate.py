
from .events import DomainEvent


class AggregateRoot:
    """
    Base class for all Aggregate Roots in the domain.
    Aggregates are the only entities that should publish Domain Events.
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._domain_events: list[DomainEvent] = []
        
    def add_event(self, event: DomainEvent) -> None:
        """Add a domain event to the aggregate's internal collection."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        self._domain_events.append(event)
        
    def collect_events(self) -> list[DomainEvent]:
        """Return all accumulated domain events."""
        if not hasattr(self, "_domain_events"):
            self._domain_events = []
        return list(self._domain_events)
        
    def clear_events(self) -> None:
        """Clear all accumulated domain events."""
        self._domain_events = []
