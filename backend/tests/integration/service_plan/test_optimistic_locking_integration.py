"""
Integration tests for Optimistic Locking in Service Plan.

This test uses the real SQLAlchemy repository and SQLite in-memory database
to prove that concurrent modifications raise OptimisticLockError due to
a DB-level collision (rowcount == 0).
"""
import asyncio
import uuid
from datetime import date
from unittest.mock import MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from modules.service_plan.domain.entities.service_plan import ServicePlan
from modules.service_plan.domain.exceptions import OptimisticLockError
from modules.service_plan.domain.value_objects import ContractReference
from modules.service_plan.infrastructure.repositories.service_plan_repository import (
    SQLAlchemyServicePlanRepository,
)


@pytest.mark.asyncio
async def test_concurrent_saves_raise_optimistic_lock_error_in_db(db_engine):
    """
    Proves that optimistic locking works with real SQLAlchemy.
    1. Create a plan and save it.
    2. Session A loads the plan.
    3. Session B loads the plan.
    4. Session A modifies and saves it (version increments).
    5. Session B attempts to save its stale copy (which still expects _original_version).
    6. The repository's UPDATE query returns rowcount == 0.
    7. OptimisticLockError is raised.
    """
    # Setup session factory
    async_session = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )

    # 1. Setup initial plan
    plan_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    
    plan = ServicePlan.create_from_contract(
        contract_reference=ContractReference(contract_id=uuid.uuid4()),
        tenant_id=tenant_id,
        company_id=uuid.uuid4(),
        effective_date=date(2025, 1, 1),
        items=[{"service_offering_id": uuid.uuid4(), "service_name": "Coleta", "quantity": "10"}],
    )
    # Force the ID so we can query it easily
    plan._id = plan_id

    async with async_session() as session:
        repo = SQLAlchemyServicePlanRepository(session)
        await repo.save(plan)
        await session.commit()

    # 2 & 3. Session A and B load the plan concurrently
    async with async_session() as session_a, async_session() as session_b:
        repo_a = SQLAlchemyServicePlanRepository(session_a)
        plan_a = await repo_a.get_by_id(plan_id)
        assert plan_a is not None
        assert plan_a.version == 1
        assert plan_a._original_version == 1

        repo_b = SQLAlchemyServicePlanRepository(session_b)
        plan_b = await repo_b.get_by_id(plan_id)
        assert plan_b is not None
        assert plan_b.version == 1
        assert plan_b._original_version == 1

        # 4. Session A mutates and saves the plan
        payload = [{
            "id": str(plan_a.schedules[0].id),
            "collection_point": {"address": "Rua A"},
            "recurrence": {
                "frequency": "WEEKLY", "interval": 1, "weekdays": [0],
                "start_time": "08:00", "end_time": "12:00",
            },
        }]
        plan_a.update_schedules(payload)
        plan_a.publish()
        
        assert plan_a.version == 2
        await repo_a.save(plan_a)
        await session_a.commit()

        # 5. Session B attempts to save its stale copy
        payload_b = [{
            "id": str(plan_b.schedules[0].id),
            "collection_point": {"address": "Rua B - Concorrente"},
            "recurrence": {
                "frequency": "WEEKLY", "interval": 1, "weekdays": [0],
                "start_time": "10:00", "end_time": "14:00",
            },
        }]
        plan_b.update_schedules(payload_b)
        
        with pytest.raises(OptimisticLockError) as exc_info:
            await repo_b.save(plan_b)
            
        assert "modified concurrently" in str(exc_info.value).lower()

@pytest.mark.asyncio
async def test_update_schedules_concurrency_conflict_in_db(db_engine):
    """
    Proves that update_schedules() detects concurrent edits, even though
    it doesn't increment the aggregate version (which stays at 1).
    """
    async_session = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    plan_id = uuid.uuid4()
    plan = ServicePlan.create_from_contract(
        contract_reference=ContractReference(contract_id=uuid.uuid4()),
        tenant_id=uuid.uuid4(),
        company_id=uuid.uuid4(),
        effective_date=date(2025, 1, 1),
        items=[{"service_offering_id": uuid.uuid4(), "service_name": "Coleta", "quantity": "10"}],
    )
    plan._id = plan_id

    # 1. Initial save
    async with async_session() as session:
        repo = SQLAlchemyServicePlanRepository(session)
        await repo.save(plan)
        await session.commit()
        
    # 2 & 3. Load concurrently
    async with async_session() as session_a, async_session() as session_b:
        repo_a = SQLAlchemyServicePlanRepository(session_a)
        plan_a = await repo_a.get_by_id(plan_id)
        
        repo_b = SQLAlchemyServicePlanRepository(session_b)
        plan_b = await repo_b.get_by_id(plan_id)
        
        # 4. Session A mutates and saves (version increments to 2 via publish)
        plan_a.update_schedules([{
            "id": str(plan_a.schedules[0].id),
            "collection_point": {"address": "A"},
            "recurrence": {
                "frequency": "WEEKLY", "interval": 1, "weekdays": [0],
                "start_time": "08:00", "end_time": "12:00",
            },
        }])
        plan_a.publish()
        await repo_a.save(plan_a)
        await session_a.commit()
        
        # 5. Session B attempts update_schedules (which does NOT increment version locally)
        plan_b.update_schedules([{
            "id": str(plan_b.schedules[0].id),
            "collection_point": {"address": "B"},
            "recurrence": {
                "frequency": "WEEKLY", "interval": 1, "weekdays": [1],
                "start_time": "09:00", "end_time": "13:00",
            },
        }])
        
        with pytest.raises(OptimisticLockError) as exc_info:
            await repo_b.save(plan_b)
            
        assert "modified concurrently" in str(exc_info.value).lower()
