"""
Unit tests for the ServicePlan Aggregate Root and ServiceSchedule Entity.

Coverage:
- create_from_contract() produces DRAFT with correct schedules
- update_schedules() — happy path and guard (non-DRAFT)
- publish() invariants (no schedules, missing collection_point, missing recurrence)
- Recurrence invalid window
- State machine: DRAFT → ACTIVE → SUSPENDED → ACTIVE → TERMINATED
- ServiceSchedule state machine: ACTIVE → PAUSED → ACTIVE → REMOVED
- version increments on every state transition
- ServicePlanCreated and ServicePlanPublished domain events emitted
"""
import uuid
from datetime import date, time

import pytest

from modules.service_plan.domain.entities.service_plan import ServicePlan
from modules.service_plan.domain.events import ServicePlanCreated, ServicePlanPublished
from modules.service_plan.domain.exceptions import (
    InvalidPlanTransitionError,
    InvalidRecurrenceWindowError,
    ScheduleEditNotAllowedError,
    ServicePlanAlreadyPublishedError,
    ServicePlanHasNoReadySchedulesError,
)
from modules.service_plan.domain.value_objects import (
    CollectionPoint,
    ContractReference,
    Recurrence,
    RecurrenceFrequency,
    ScheduleStatus,
    ServicePlanStatus,
    Weekday,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

TENANT_ID = uuid.uuid4()
COMPANY_ID = uuid.uuid4()
CONTRACT_ID = uuid.uuid4()
OFFERING_ID = uuid.uuid4()

ITEMS = [
    {"service_offering_id": str(OFFERING_ID), "service_name": "Coleta Orgânica"},
    {"service_offering_id": str(uuid.uuid4()), "service_name": "Coleta Reciclável"},
]

VALID_COLLECTION_POINT = CollectionPoint(
    address="Rua das Flores, 123 — Galpão A",
    latitude=-23.5505,
    longitude=-46.6333,
)

VALID_RECURRENCE = Recurrence(
    frequency=RecurrenceFrequency.WEEKLY,
    interval=1,
    weekdays=[Weekday.MON, Weekday.THU],
    start_time=time(8, 0),
    end_time=time(12, 0),
    timezone="America/Sao_Paulo",
)


def _make_plan(items: list | None = None) -> ServicePlan:
    return ServicePlan.create_from_contract(
        contract_reference=ContractReference(contract_id=CONTRACT_ID),
        tenant_id=TENANT_ID,
        company_id=COMPANY_ID,
        effective_date=date(2025, 1, 1),
        items=items or ITEMS,
    )


def _fill_all_schedules(plan: ServicePlan) -> None:
    payload = [
        {
            "id": str(s.id),
            "collection_point": {
                "address": "Rua das Flores, 123",
                "latitude": -23.55,
                "longitude": -46.63,
            },
            "recurrence": {
                "frequency": "WEEKLY",
                "interval": 1,
                "weekdays": [0, 3],
                "start_time": "08:00",
                "end_time": "12:00",
                "timezone": "America/Sao_Paulo",
            },
        }
        for s in plan.schedules
    ]
    plan.update_schedules(payload)


# ---------------------------------------------------------------------------
# create_from_contract
# ---------------------------------------------------------------------------


class TestCreateFromContract:
    def test_creates_draft_plan(self):
        plan = _make_plan()
        assert plan.status == ServicePlanStatus.DRAFT

    def test_creates_one_schedule_per_item(self):
        plan = _make_plan()
        assert len(plan.schedules) == len(ITEMS)

    def test_schedules_start_without_collection_point(self):
        plan = _make_plan()
        for schedule in plan.schedules:
            assert schedule.collection_point is None

    def test_schedules_start_without_recurrence(self):
        plan = _make_plan()
        for schedule in plan.schedules:
            assert schedule.recurrence is None

    def test_schedules_start_active(self):
        plan = _make_plan()
        for schedule in plan.schedules:
            assert schedule.status == ScheduleStatus.ACTIVE

    def test_service_name_snapshot_is_preserved(self):
        plan = _make_plan()
        names = {s.service_name for s in plan.schedules}
        assert "Coleta Orgânica" in names
        assert "Coleta Reciclável" in names

    def test_emits_service_plan_created_event(self):
        plan = _make_plan()
        events = plan.collect_events()
        assert any(isinstance(e, ServicePlanCreated) for e in events)

    def test_version_starts_at_1(self):
        plan = _make_plan()
        assert plan.version == 1


# ---------------------------------------------------------------------------
# update_schedules
# ---------------------------------------------------------------------------


class TestUpdateSchedules:
    def test_fills_collection_point_and_recurrence(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        for schedule in plan.schedules:
            assert schedule.collection_point is not None
            assert schedule.recurrence is not None

    def test_raises_when_plan_is_not_draft(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        plan.publish()

        with pytest.raises(ScheduleEditNotAllowedError):
            _fill_all_schedules(plan)


# ---------------------------------------------------------------------------
# publish() invariants
# ---------------------------------------------------------------------------


class TestPublish:
    def test_raises_when_no_schedules_ready(self):
        plan = _make_plan()
        # schedules have no collection_point or recurrence
        with pytest.raises(ServicePlanHasNoReadySchedulesError):
            plan.publish()

    def test_raises_when_missing_collection_point(self):
        plan = _make_plan(items=[ITEMS[0]])
        # set only recurrence, no collection_point
        schedule = plan.schedules[0]
        schedule.set_recurrence(VALID_RECURRENCE)
        with pytest.raises(ServicePlanHasNoReadySchedulesError):
            plan.publish()

    def test_raises_when_missing_recurrence(self):
        plan = _make_plan(items=[ITEMS[0]])
        schedule = plan.schedules[0]
        schedule.set_collection_point(VALID_COLLECTION_POINT)
        with pytest.raises(ServicePlanHasNoReadySchedulesError):
            plan.publish()

    def test_raises_when_collection_point_address_empty(self):
        plan = _make_plan(items=[ITEMS[0]])
        schedule = plan.schedules[0]
        schedule.set_collection_point(CollectionPoint(address="   "))
        schedule.set_recurrence(VALID_RECURRENCE)
        with pytest.raises(ServicePlanHasNoReadySchedulesError):
            plan.publish()

    def test_publishes_when_all_ready(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        plan.publish()
        assert plan.status == ServicePlanStatus.ACTIVE
        assert plan.published_at is not None

    def test_emits_service_plan_published_event(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        plan.collect_events()  # clear creation event
        plan.publish()
        events = plan.collect_events()
        assert any(isinstance(e, ServicePlanPublished) for e in events)

    def test_increments_version_on_publish(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        assert plan.version == 1
        plan.publish()
        assert plan.version == 2

    def test_raises_if_already_published(self):
        plan = _make_plan()
        _fill_all_schedules(plan)
        plan.publish()
        with pytest.raises(ServicePlanAlreadyPublishedError):
            plan.publish()


# ---------------------------------------------------------------------------
# State machine — ServicePlan
# ---------------------------------------------------------------------------


class TestServicePlanStateMachine:
    def _published_plan(self) -> ServicePlan:
        plan = _make_plan()
        _fill_all_schedules(plan)
        plan.publish()
        return plan

    def test_active_can_be_suspended(self):
        plan = self._published_plan()
        plan.suspend()
        assert plan.status == ServicePlanStatus.SUSPENDED

    def test_suspended_can_be_reactivated(self):
        plan = self._published_plan()
        plan.suspend()
        plan.reactivate()
        assert plan.status == ServicePlanStatus.ACTIVE

    def test_active_can_be_terminated(self):
        plan = self._published_plan()
        plan.terminate()
        assert plan.status == ServicePlanStatus.TERMINATED

    def test_suspended_can_be_terminated(self):
        plan = self._published_plan()
        plan.suspend()
        plan.terminate()
        assert plan.status == ServicePlanStatus.TERMINATED

    def test_cannot_suspend_draft(self):
        plan = _make_plan()
        with pytest.raises(InvalidPlanTransitionError):
            plan.suspend()

    def test_cannot_reactivate_active(self):
        plan = self._published_plan()
        with pytest.raises(InvalidPlanTransitionError):
            plan.reactivate()

    def test_version_increments_on_each_transition(self):
        plan = self._published_plan()
        v_after_publish = plan.version
        plan.suspend()
        assert plan.version == v_after_publish + 1
        plan.reactivate()
        assert plan.version == v_after_publish + 2


# ---------------------------------------------------------------------------
# State machine — ServiceSchedule
# ---------------------------------------------------------------------------


class TestServiceScheduleStateMachine:
    def test_pause_active_schedule(self):
        plan = _make_plan()
        schedule = plan.schedules[0]
        schedule.pause()
        assert schedule.status == ScheduleStatus.PAUSED

    def test_reactivate_paused_schedule(self):
        plan = _make_plan()
        schedule = plan.schedules[0]
        schedule.pause()
        schedule.reactivate()
        assert schedule.status == ScheduleStatus.ACTIVE

    def test_remove_schedule(self):
        plan = _make_plan()
        schedule = plan.schedules[0]
        schedule.remove()
        assert schedule.status == ScheduleStatus.REMOVED

    def test_cannot_pause_removed_schedule(self):
        plan = _make_plan()
        schedule = plan.schedules[0]
        schedule.remove()
        with pytest.raises(ValueError):
            schedule.pause()

    def test_publish_ignores_removed_schedules(self):
        """publish() only requires at least 1 ACTIVE ready schedule."""
        plan = _make_plan(items=[ITEMS[0], ITEMS[1]])
        # Fill only first, remove second
        plan.schedules[0].set_collection_point(VALID_COLLECTION_POINT)
        plan.schedules[0].set_recurrence(VALID_RECURRENCE)
        plan.schedules[1].remove()
        plan.publish()
        assert plan.status == ServicePlanStatus.ACTIVE


# ---------------------------------------------------------------------------
# Recurrence value object
# ---------------------------------------------------------------------------


class TestRecurrenceValidation:
    def test_raises_when_start_gte_end(self):
        with pytest.raises(InvalidRecurrenceWindowError):
            Recurrence(
                frequency=RecurrenceFrequency.WEEKLY,
                interval=1,
                start_time=time(12, 0),
                end_time=time(8, 0),
            )

    def test_raises_when_start_equals_end(self):
        with pytest.raises(InvalidRecurrenceWindowError):
            Recurrence(
                frequency=RecurrenceFrequency.DAILY,
                interval=1,
                start_time=time(8, 0),
                end_time=time(8, 0),
            )

    def test_valid_recurrence_is_created(self):
        rec = Recurrence(
            frequency=RecurrenceFrequency.BIWEEKLY,
            interval=2,
            weekdays=[Weekday.TUE, Weekday.FRI],
            start_time=time(7, 0),
            end_time=time(11, 0),
            timezone="America/Manaus",
        )
        assert rec.interval == 2
        assert rec.timezone == "America/Manaus"
