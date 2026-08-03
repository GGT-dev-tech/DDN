from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

import pytest

from database.core.unit_of_work import SQLAlchemyUnitOfWork
from shared_kernel.contracts.aggregate_root import AggregateRoot
from shared_kernel.events.integration import EventMetadata, IntegrationEvent


class MockAggregate(AggregateRoot):
    def __init__(self, id, version):
        super().__init__()
        self._id = id
        self._version = version

    @property
    def id(self):
        return self._id

    @property
    def version(self):
        return self._version

def test_uow_atomicity_and_event_collection():
    mock_session = Mock()
    mock_outbox_repo = Mock()
    
    uow = SQLAlchemyUnitOfWork(session=mock_session, outbox_repository=mock_outbox_repo)
    
    aggregate = MockAggregate(id=uuid4(), version=1)
    event = IntegrationEvent(
        metadata=EventMetadata(
            event_id=uuid4(),
            tenant_id=None,
            correlation_id="corr",
            causation_id=None,
            occurred_at=datetime.now(UTC),
            event_schema_version=1,
            aggregate_version=1
        )
    )
    aggregate.add_event(event)
    
    with uow.begin():
        uow.collect_events(aggregate)
        # Verify events are cleared from aggregate
        assert len(aggregate.collect_events()) == 0
        assert len(uow.events) == 1
        
        uow.commit()
        
    # Verify outbox repository save was called BEFORE session.commit
    mock_outbox_repo.save.assert_called_once_with([event])
    mock_session.commit.assert_called_once()
    
    # Verify events are cleared after commit
    assert len(uow.events) == 0

def test_uow_rollback_clears_events():
    mock_session = Mock()
    mock_outbox_repo = Mock()
    
    uow = SQLAlchemyUnitOfWork(session=mock_session, outbox_repository=mock_outbox_repo)
    
    aggregate = MockAggregate(id=uuid4(), version=1)
    event = IntegrationEvent(
        metadata=EventMetadata(
            event_id=uuid4(),
            tenant_id=None,
            correlation_id="corr",
            causation_id=None,
            occurred_at=datetime.now(UTC),
            event_schema_version=1,
            aggregate_version=1
        )
    )
    aggregate.add_event(event)
    
    with pytest.raises(ValueError), uow.begin():
        uow.collect_events(aggregate)
        raise ValueError("Something went wrong")
            
    # Verify rollback was called
    mock_session.rollback.assert_called_once()
    mock_session.commit.assert_not_called()
    mock_outbox_repo.save.assert_not_called()
    
    # Verify events are cleared from UoW
    assert len(uow.events) == 0
