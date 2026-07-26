from abc import ABC, abstractmethod
from contextlib import contextmanager

from sqlalchemy.orm import Session

from shared_kernel.contracts.aggregate_root import AggregateRoot
from shared_kernel.events.base import DomainEvent
from shared_kernel.messaging.outbox_repository import OutboxRepository


class UnitOfWork(ABC):
    @abstractmethod
    @contextmanager
    def begin(self):
        """Starts a transaction"""
        
    @abstractmethod
    def commit(self):
        """Commits transaction and flushes events to outbox"""
        
    @abstractmethod
    def rollback(self):
        """Rolls back transaction"""
        
    @abstractmethod
    def collect_events(self, aggregate: AggregateRoot):
        """Collects events from an aggregate to be published/stored during commit"""

class SQLAlchemyUnitOfWork(UnitOfWork):
    def __init__(self, session: Session, outbox_repository: OutboxRepository):
        self.session = session
        self.outbox_repository = outbox_repository
        self.events: list[DomainEvent] = []
        
    @contextmanager
    def begin(self):
        try:
            yield
        except Exception:
            self.rollback()
            raise
            
    def commit(self):
        if self.events:
            self.outbox_repository.save(list(self.events))
        self.session.commit()
        self.events.clear()
        
    def rollback(self):
        self.session.rollback()
        self.events.clear()
        
    def collect_events(self, aggregate: AggregateRoot):
        self.events.extend(aggregate.collect_events())
        aggregate.clear_events()
