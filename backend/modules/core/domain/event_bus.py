from abc import ABC, abstractmethod
from typing import List, Callable, Awaitable
from .events import EventEnvelope

class EventBus(ABC):
    @abstractmethod
    async def publish(self, event: EventEnvelope) -> None:
        pass

    @abstractmethod
    def subscribe(self, event_name: str, handler: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        pass

class MemoryEventBus(EventBus):
    def __init__(self):
        self._handlers = {}

    async def publish(self, event: EventEnvelope) -> None:
        handlers = self._handlers.get(event.name, [])
        for handler in handlers:
            await handler(event)

    def subscribe(self, event_name: str, handler: Callable[[EventEnvelope], Awaitable[None]]) -> None:
        if event_name not in self._handlers:
            self._handlers[event_name] = []
        self._handlers[event_name].append(handler)
