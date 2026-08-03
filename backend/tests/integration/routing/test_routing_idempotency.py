import uuid
from datetime import datetime

import pytest
from sqlalchemy import select

from modules.routing.application.handlers.service_plan_published_handler import (
    ServicePlanPublishedHandler,
)
from modules.routing.infrastructure.orm_models import CollectionRequirementModel
from modules.routing.infrastructure.repositories.sqlalchemy_requirement_repository import (
    SQLAlchemyRequirementRepository,
)
from modules.service_plan.domain.integration_events import ServicePlanPublished
from shared_kernel.events.integration import EventMetadata


@pytest.fixture
def fake_event_metadata():
    return EventMetadata(
        event_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        correlation_id="123",
        causation_id="123",
        occurred_at=datetime.utcnow(),
        event_schema_version=1,
        aggregate_version=1,
    )

@pytest.fixture
def fake_event_payload():
    return {
        "tenant_id": uuid.uuid4(),
        "plan_id": uuid.uuid4(),
        "company_id": uuid.uuid4(),
        "schedules": [
            {
                "id": uuid.uuid4(),
                "service_offering_id": uuid.uuid4(),
                "service_name": "Waste Collection",
                "quantity_snapshot": "500.5",
                "unit_of_measure": "KG",
                "status": "ACTIVE",
                "collection_point": {
                    "latitude": -23.550520,
                    "longitude": -46.633308,
                    "address": "Av Paulista",
                    "reference": "Front door"
                },
                "recurrence": {
                    "frequency": "WEEKLY",
                    "interval": 1,
                    "weekdays": [1, 3],  # Tuesday, Thursday
                    "start_time": "08:00",
                    "end_time": "12:00",
                    "timezone": "America/Sao_Paulo"
                }
            }
        ]
    }


@pytest.mark.asyncio
async def test_idempotency_of_service_plan_published(db_session, fake_event_payload, fake_event_metadata):
    """
    Test that sending the same ServicePlanPublished event multiple times
    results in a single CollectionRequirement with incremented version.
    """
    repo = SQLAlchemyRequirementRepository(db_session)
    handler = ServicePlanPublishedHandler(repo)
    
    event = ServicePlanPublished(
        metadata=fake_event_metadata,
        plan_id=fake_event_payload["plan_id"],
        tenant_id=fake_event_payload["tenant_id"],
        company_id=fake_event_payload["company_id"],
        contract_id=uuid.uuid4(),
        effective_date="2026-01-01",
        expiration_date=None,
        schedules=fake_event_payload["schedules"],
    )
    
    # 1. First execution
    await handler.handle(event)
    await db_session.commit()
    
    # Assert requirement was created
    stmt = select(CollectionRequirementModel).where(
        CollectionRequirementModel.tenant_id == fake_event_payload["tenant_id"]
    )
    res1 = (await db_session.execute(stmt)).scalars().all()
    assert len(res1) == 1
    req1 = res1[0]
    assert req1.version == 1
    assert req1.quantity == 500.5
    assert req1.unit_of_measure == "KG"
    
    # 2. Second execution (duplicate event)
    # Let's say we change a detail slightly in the duplicate or an update event
    fake_event_payload["schedules"][0]["quantity_snapshot"] = "600.0"
    event2 = ServicePlanPublished(
        metadata=fake_event_metadata,
        plan_id=fake_event_payload["plan_id"],
        tenant_id=fake_event_payload["tenant_id"],
        company_id=fake_event_payload["company_id"],
        contract_id=uuid.uuid4(),
        effective_date="2026-01-01",
        expiration_date=None,
        schedules=fake_event_payload["schedules"],
    )
    
    await handler.handle(event2)
    await db_session.commit()
    db_session.expunge_all()  # Clear identity map to read fresh data
    
    # Assert requirement was updated, not duplicated
    res2 = (await db_session.execute(stmt)).scalars().all()
    assert len(res2) == 1  # Still 1 record
    req2 = res2[0]
    assert req2.id == req1.id
    assert req2.version == 2  # Version incremented
    assert req2.quantity == 600.0  # Details updated


@pytest.mark.asyncio
async def test_deactivation_on_status_change(db_session, fake_event_payload, fake_event_metadata):
    """
    Test that if the schedule status changes to something other than ACTIVE,
    the requirement is deactivated.
    """
    repo = SQLAlchemyRequirementRepository(db_session)
    handler = ServicePlanPublishedHandler(repo)
    
    # 1. Create Active
    event1 = ServicePlanPublished(
        metadata=fake_event_metadata,
        plan_id=fake_event_payload["plan_id"],
        tenant_id=fake_event_payload["tenant_id"],
        company_id=fake_event_payload["company_id"],
        contract_id=uuid.uuid4(),
        effective_date="2026-01-01",
        expiration_date=None,
        schedules=fake_event_payload["schedules"],
    )
    await handler.handle(event1)
    await db_session.commit()
    
    # 2. Update to INACTIVE/PAUSED
    fake_event_payload["schedules"][0]["status"] = "PAUSED"
    event2 = ServicePlanPublished(
        metadata=fake_event_metadata,
        plan_id=fake_event_payload["plan_id"],
        tenant_id=fake_event_payload["tenant_id"],
        company_id=fake_event_payload["company_id"],
        contract_id=uuid.uuid4(),
        effective_date="2026-01-01",
        expiration_date=None,
        schedules=fake_event_payload["schedules"],
    )
    await handler.handle(event2)
    await db_session.commit()
    
    stmt = select(CollectionRequirementModel).where(
        CollectionRequirementModel.tenant_id == fake_event_payload["tenant_id"]
    )
    reqs = (await db_session.execute(stmt)).scalars().all()
    assert len(reqs) == 1
    
    from modules.routing.domain.value_objects import RequirementStatus
    assert reqs[0].status == RequirementStatus.INACTIVE
