from typing import Protocol, runtime_checkable

from shared_kernel.events.integration import IntegrationEvent


@runtime_checkable
class OutboxProcessorProtocol(Protocol):
    """
    Protocol for processing events stored in the Outbox.
    The implementation will be responsible for fetching events and routing them to a broker/worker.
    """
    async def process(self, event: IntegrationEvent) -> None:
        ...
