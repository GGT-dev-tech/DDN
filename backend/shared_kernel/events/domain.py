from typing import Protocol, runtime_checkable


@runtime_checkable
class DomainEventProtocol(Protocol):
    """
    Protocol for purely internal Domain Events emitted by an Aggregate Root.
    Internal domain events do not carry cross-context integration metadata
    (like correlation_id) by default. They are simple fact records used internally
    to trigger side-effects or build integration events.
    """
