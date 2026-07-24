from abc import ABC, abstractmethod
from typing import List
from contextlib import contextmanager
from sqlalchemy.orm import Session
from modules.core.domain.events import DomainEvent
from modules.core.domain.aggregate import AggregateRoot

class UnitOfWork(ABC):
    @abstractmethod
    @contextmanager
    def begin(self):
        """Starts a transaction"""
        pass
        
    @abstractmethod
    def commit(self):
        """Commits transaction and flushes events to outbox"""
        pass
        
    @abstractmethod
    def rollback(self):
        """Rolls back transaction"""
        pass
        
    @abstractmethod
    def collect_events(self, aggregate: AggregateRoot):
        """Collects events from an aggregate to be published/stored during commit"""
        pass

class SQLAlchemyUnitOfWork(UnitOfWork):
    def __init__(self, session: Session):
        self.session = session
        self.events: List[DomainEvent] = []
        
    @contextmanager
    def begin(self):
        try:
            yield
        except Exception:
            self.rollback()
            raise
            
    def commit(self):
        # We could process the self.events here (e.g. saving them to the outbox table)
        # For now we just clear them and commit
        self.session.commit()
        self.events.clear()
        
    def rollback(self):
        self.session.rollback()
        self.events.clear()
        
    def collect_events(self, aggregate: AggregateRoot):
        self.events.extend(aggregate.collect_events())
        aggregate.clear_events()
