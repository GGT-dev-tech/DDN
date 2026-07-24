import pytest
from unittest.mock import Mock, call
from uuid import uuid4
from datetime import datetime, UTC

from modules.core.infrastructure.outbox_repository import SQLAlchemyOutboxRepository
from modules.core.infrastructure.outbox import OutboxEvent
from shared_kernel.events.base import DomainEvent, EventMetadata

def test_outbox_repository_save():
    mock_session = Mock()
    mock_serializer = Mock()
    
    repo = SQLAlchemyOutboxRepository(session=mock_session, serializer=mock_serializer)
    
    event_id = uuid4()
    tenant_id = uuid4()
    
    # Mock serializer output
    mock_serializer.serialize.return_value = {
        "metadata": {
            "event_id": event_id,
            "tenant_id": tenant_id,
            "correlation_id": "corr",
            "event_schema_version": 1
        },
        "payload": {"data": "test"}
    }
    
    event = DomainEvent(
        metadata=EventMetadata(
            event_id=event_id,
            tenant_id=tenant_id,
            correlation_id="corr",
            causation_id=None,
            occurred_at=datetime.now(UTC),
            event_schema_version=1,
            aggregate_version=1
        )
    )
    
    repo.save([event])
    
    # Assert session.add was called with an OutboxEvent instance
    assert mock_session.add.call_count == 1
    added_event = mock_session.add.call_args[0][0]
    
    assert isinstance(added_event, OutboxEvent)
    assert added_event.id == event_id
    assert added_event.tenant_id == tenant_id
    assert added_event.status == "PENDING"
    assert added_event.payload == {"data": "test"}
    assert added_event.headers["schema"] == "v1"

def test_outbox_repository_lock_batch():
    mock_session = Mock()
    mock_serializer = Mock()
    
    repo = SQLAlchemyOutboxRepository(session=mock_session, serializer=mock_serializer)
    
    # Mock the return value of session.scalars().all()
    mock_scalars = Mock()
    mock_scalars.all.return_value = [uuid4(), uuid4()]
    mock_session.scalars.return_value = mock_scalars
    
    locked_ids = repo.lock_batch(batch_size=10, worker_id="worker-1")
    
    assert len(locked_ids) == 2
    assert mock_session.execute.call_count == 1
    assert mock_session.commit.call_count == 1
