from abc import ABC, abstractmethod
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from shared_kernel.contracts.aggregate_root import AggregateRoot
from shared_kernel.events.integration import IntegrationEvent
from shared_kernel.outbox.repository import OutboxRepository


class UnitOfWork(ABC):
    """
    Abstract Unit of Work (UoW).
    Garante atomicidade em múltiplos repositórios e eventos.
    """
    
    @abstractmethod
    async def __aenter__(self) -> 'UnitOfWork':
        pass

    @abstractmethod
    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        pass

    @abstractmethod
    async def commit(self) -> None:
        pass

    @abstractmethod
    async def rollback(self) -> None:
        pass

    @abstractmethod
    def collect_events(self, aggregate: AggregateRoot) -> None:
        pass


class SQLAlchemyUnitOfWork(UnitOfWork):
    """
    SQLAlchemy implementation of the Unit of Work.
    Wraps an existing AsyncSession (e.g. from FastAPI Depends).
    Does NOT close the session, leaving lifecycle management to the dependency injector.
    """
    def __init__(self, session: AsyncSession, outbox_repository: OutboxRepository | None = None):
        self.session = session
        self.outbox_repository = outbox_repository
        self.events: list[IntegrationEvent] = []

    async def __aenter__(self) -> 'SQLAlchemyUnitOfWork':
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if exc_type is not None:
            await self.rollback()
        # MD-05: We do not close the session here because FastAPI's Yield dependency manages it.
        # Closing it would break subsequent middleware or response handlers.

    async def commit(self) -> None:
        if self.events and self.outbox_repository:
            await self.outbox_repository.save(list(self.events))
            
        if self.session:
            await self.session.commit()
            
        self.events.clear()

    async def rollback(self) -> None:
        if self.session:
            await self.session.rollback()
        self.events.clear()

    def collect_events(self, aggregate: AggregateRoot) -> None:
        self.events.extend(aggregate.collect_events())
        aggregate.clear_events()
