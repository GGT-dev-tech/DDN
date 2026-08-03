"""
Unit tests for the optimistic locking contract.

These tests use a fake in-memory repository to verify that:
1. _original_version is set correctly on create and load.
2. Concurrent saves (two instances of the same plan) raise OptimisticLockError.
3. publish(), suspend(), reactivate() all increment version correctly.
4. update_schedules() does NOT increment version (it's a data fill, not a state change).
5. The API layer maps OptimisticLockError → HTTP 409.
"""
import uuid
from datetime import date, time
from unittest.mock import AsyncMock

import pytest

from modules.service_plan.domain.entities.service_plan import ServicePlan
from modules.service_plan.domain.exceptions import (
    OptimisticLockError,
)
from modules.service_plan.domain.value_objects import (
    CollectionPoint,
    ContractReference,
    Recurrence,
    RecurrenceFrequency,
    Weekday,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TENANT = uuid.uuid4()
COMPANY = uuid.uuid4()
CONTRACT = uuid.uuid4()
OFFERING = uuid.uuid4()

ITEMS = [{"service_offering_id": str(OFFERING), "service_name": "Coleta Orgânica"}]

COLLECTION_POINT = CollectionPoint(address="Rua das Flores, 123")
RECURRENCE = Recurrence(
    frequency=RecurrenceFrequency.WEEKLY,
    interval=1,
    weekdays=[Weekday.MON],
    start_time=time(8, 0),
    end_time=time(12, 0),
)


def _make_plan() -> ServicePlan:
    return ServicePlan.create_from_contract(
        contract_reference=ContractReference(contract_id=CONTRACT),
        tenant_id=TENANT,
        company_id=COMPANY,
        effective_date=date(2025, 1, 1),
        items=ITEMS,
    )


def _fill_and_publish(plan: ServicePlan) -> None:
    payload = [
        {
            "id": str(plan.schedules[0].id),
            "collection_point": {"address": "Rua das Flores, 123"},
            "recurrence": {
                "frequency": "WEEKLY",
                "interval": 1,
                "weekdays": [0],
                "start_time": "08:00",
                "end_time": "12:00",
            },
        }
    ]
    plan.update_schedules(payload)
    plan.publish()


# ---------------------------------------------------------------------------
# _original_version tracking
# ---------------------------------------------------------------------------


class TestOriginalVersion:
    def test_original_version_equals_initial_version_on_create(self):
        plan = _make_plan()
        assert plan._original_version == 1
        assert plan.version == 1

    def test_original_version_stays_frozen_after_publish(self):
        """
        _original_version must NOT change when the aggregate mutates in memory.
        The repository needs it to detect what was in the DB at load time.
        """
        plan = _make_plan()
        _fill_and_publish(plan)
        assert plan.version == 2          # incremented by publish()
        assert plan._original_version == 1  # stays at what was in DB

    def test_original_version_stays_frozen_after_suspend(self):
        plan = _make_plan()
        _fill_and_publish(plan)
        original = plan._original_version
        plan.suspend()
        assert plan.version == 3
        assert plan._original_version == original  # unchanged

    def test_update_schedules_does_not_increment_version(self):
        """
        update_schedules() fills in data but is not a state transition.
        version stays at 1; _original_version stays at 1.
        The repo will compare DB(1) == _original_version(1) → no conflict.
        """
        plan = _make_plan()
        payload = [
            {
                "id": str(plan.schedules[0].id),
                "collection_point": {"address": "Rua A, 1"},
                "recurrence": {
                    "frequency": "WEEKLY",
                    "interval": 1,
                    "weekdays": [0],
                    "start_time": "08:00",
                    "end_time": "12:00",
                },
            }
        ]
        plan.update_schedules(payload)
        assert plan.version == 1
        assert plan._original_version == 1


# ---------------------------------------------------------------------------
# Fake repository for concurrency simulation
# ---------------------------------------------------------------------------


class FakeServicePlanRepository:
    """
    In-memory repository that enforces optimistic locking.
    Simulates the contract: WHERE version = plan._original_version.
    """

    def __init__(self):
        self._store: dict[uuid.UUID, ServicePlan] = {}

    async def save(self, plan: ServicePlan) -> None:
        from modules.service_plan.domain.exceptions import OptimisticLockError

        if plan.id not in self._store:
            # INSERT path — no version check needed
            self._store[plan.id] = plan
            return

        stored = self._store[plan.id]
        if stored.version != plan._original_version:
            raise OptimisticLockError(
                f"Expected DB version {plan._original_version}, "
                f"found {stored.version}. Concurrent modification detected."
            )

        self._store[plan.id] = plan

    async def get_by_id(self, plan_id: uuid.UUID) -> ServicePlan | None:
        return self._store.get(plan_id)

    async def list_by_contract(self, contract_id, tenant_id):
        return [
            p for p in self._store.values()
            if p.contract_reference.contract_id == contract_id
        ]


# ---------------------------------------------------------------------------
# Concurrency scenarios
# ---------------------------------------------------------------------------


class TestConcurrencyOptimisticLock:
    @pytest.mark.asyncio
    async def test_first_save_succeeds(self):
        repo = FakeServicePlanRepository()
        plan = _make_plan()
        await repo.save(plan)
        assert await repo.get_by_id(plan.id) is not None

    @pytest.mark.asyncio
    async def test_sequential_saves_succeed(self):
        """
        Reader A saves → Reader B loads the saved plan → B saves again.
        No conflict because B's _original_version == DB version.
        """
        repo = FakeServicePlanRepository()

        plan_a = _make_plan()
        await repo.save(plan_a)  # INSERT, version=1

        # Simulate B loading the same plan
        plan_b = await repo.get_by_id(plan_a.id)
        assert plan_b is not None
        assert plan_b._original_version == 1

        # B makes no change — just saves again
        await repo.save(plan_b)  # UPDATE WHERE version=1, DB has 1 → OK

    @pytest.mark.asyncio
    async def test_concurrent_saves_raise_optimistic_lock_error(self):
        """
        Two sessions read the same plan (both see version=1).
        Session A publishes and saves (DB version becomes 2).
        Session B tries to save with _original_version=1 but DB has 2.
        OptimisticLockError must be raised.
        """
        repo = FakeServicePlanRepository()

        # Initial state
        original = _make_plan()
        await repo.save(original)  # INSERT

        # Session A: load, publish, save
        plan_a = _make_plan.__func__(  # type: ignore[attr-defined]
        ) if False else _make_plan()
        plan_a._id = original.id  # same ID
        plan_a._original_version = 1
        _fill_and_publish(plan_a)
        await repo.save(plan_a)  # UPDATE WHERE version=1 → sets DB to version=2

        # Update stored version to simulate DB state after Session A committed
        repo._store[original.id].version = 2

        # Session B: loaded the same original (version=1), tries to save
        plan_b = _make_plan()
        plan_b._id = original.id
        plan_b._original_version = 1  # still sees old version
        plan_b.version = 1

        with pytest.raises(OptimisticLockError):
            await repo.save(plan_b)

    @pytest.mark.asyncio
    async def test_update_schedules_conflict_is_detected(self):
        """
        update_schedules() does not increment version.
        If another session already mutated the plan (DB version > 1),
        the lock must still fire even though plan.version == plan._original_version.
        """
        repo = FakeServicePlanRepository()
        original = _make_plan()
        await repo.save(original)

        # Simulate DB was updated by another session (version now = 2)
        repo._store[original.id].version = 2

        # Our session loaded version=1
        plan = _make_plan()
        plan._id = original.id
        plan._original_version = 1
        plan.version = 1  # update_schedules doesn't increment

        payload = [
            {
                "id": str(plan.schedules[0].id),
                "collection_point": {"address": "Novo Endereço"},
                "recurrence": {
                    "frequency": "WEEKLY", "interval": 1, "weekdays": [0],
                    "start_time": "08:00", "end_time": "12:00",
                },
            }
        ]
        plan.update_schedules(payload)

        with pytest.raises(OptimisticLockError):
            await repo.save(plan)


# ---------------------------------------------------------------------------
# API 409 mapping
# ---------------------------------------------------------------------------


class TestAPIOptimisticLockMapping:
    """Verify that OptimisticLockError is mapped to HTTP 409."""

    @pytest.mark.asyncio
    async def test_publish_returns_409_on_lock_conflict(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        from apps.api_gateway.src.routes.service_plan import get_service_plan_service, router
        from modules.service_plan.application.services.service_plan_service import (
            ServicePlanService,
        )

        mock_service = AsyncMock(spec=ServicePlanService)
        mock_service.publish.side_effect = OptimisticLockError("concurrent edit")

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")
        app.dependency_overrides[get_service_plan_service] = lambda: mock_service

        client = TestClient(app)
        plan_id = uuid.uuid4()
        response = client.post(f"/api/v1/service-plans/{plan_id}/publish")

        assert response.status_code == 409
        assert "concurrent" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_patch_returns_409_on_lock_conflict(self):
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        from apps.api_gateway.src.routes.service_plan import get_service_plan_service, router
        from modules.service_plan.application.services.service_plan_service import (
            ServicePlanService,
        )

        mock_service = AsyncMock(spec=ServicePlanService)
        mock_service.update_schedules.side_effect = OptimisticLockError("concurrent edit")

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")
        app.dependency_overrides[get_service_plan_service] = lambda: mock_service

        plan_id = uuid.uuid4()
        client = TestClient(app)
        response = client.patch(
            f"/api/v1/service-plans/{plan_id}",
            json={"schedules": []},
        )
        assert response.status_code == 409
