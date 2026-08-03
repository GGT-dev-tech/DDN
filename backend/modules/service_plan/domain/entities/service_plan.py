from __future__ import annotations

"""
Service Plan — Aggregate Root.

Invariants enforced:
  1. ServiceSchedule is NEVER accessed via its own repository (D6).
  2. update_schedules() is only allowed in DRAFT status.
  3. publish() validates all active schedules are ready.
  4. version is incremented on every state-mutating operation (D7).
"""
import uuid
from datetime import UTC, date, datetime, time
from typing import Any

from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator
from modules.service_plan.domain.entities.schedule import ServiceSchedule
from modules.service_plan.domain.events import (
    ServicePlanCreated,
    ServicePlanPublished,
    ServicePlanSuspended,
)
from modules.service_plan.domain.exceptions import (
    InvalidPlanTransitionError,
    ScheduleEditNotAllowedError,
    ScheduleNotFoundError,
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


class ServicePlan(AggregateRoot):
    """
    Aggregate Root for the Service Plan Bounded Context.

    Represents the operational collection plan derived from an active contract.
    One contract can originate one or many ServicePlans (phases, units, addenda).
    Identity is plan.id + contract_reference — company_id is a consultive field only (D3/D4).
    """

    def __init__(
        self,
        id: uuid.UUID,
        tenant_id: uuid.UUID,
        company_id: uuid.UUID,
        contract_reference: ContractReference,
        status: ServicePlanStatus,
        effective_date: date,
        version: int = 1,
        expiration_date: date | None = None,
        published_at: datetime | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        schedules: list[ServiceSchedule] | None = None,
    ) -> None:
        super().__init__()
        self._id = id
        self.tenant_id = tenant_id
        self.company_id = company_id
        self.contract_reference = contract_reference
        self.status = status
        self.effective_date = effective_date
        self.version = version
        self.expiration_date = expiration_date
        self.published_at = published_at
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)
        self.schedules: list[ServiceSchedule] = schedules or []
        # _original_version tracks the version at load/create time.
        # The repository uses it for optimistic locking: WHERE version = _original_version.
        # This correctly detects concurrent edits even for update_schedules()
        # (which doesn't increment version).
        self._original_version: int = version


    @property
    def id(self) -> uuid.UUID:
        return self._id

    # ------------------------------------------------------------------
    # Factory
    # ------------------------------------------------------------------

    @classmethod
    def create_from_contract(
        cls,
        contract_reference: ContractReference,
        tenant_id: uuid.UUID,
        company_id: uuid.UUID,
        effective_date: date,
        items: list[dict[str, Any]],
        expiration_date: date | None = None,
    ) -> ServicePlan:
        """
        Creates a DRAFT ServicePlan with one ServiceSchedule per contract item.
        CollectionPoint and Recurrence start as None — operator fills them in
        via update_schedules() before calling publish().
        """
        plan = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            company_id=company_id,
            contract_reference=contract_reference,
            status=ServicePlanStatus.DRAFT,
            effective_date=effective_date,
            expiration_date=expiration_date,
            version=1,
        )

        for item in items:
            schedule = ServiceSchedule(
                id=IdGenerator.generate(),
                service_offering_id=uuid.UUID(str(item["service_offering_id"])),
                service_name=str(item.get("service_name", "")),
                quantity_snapshot=str(item.get("quantity", "0")),  # snapshot (D1)
                status=ScheduleStatus.ACTIVE,
            )
            plan.schedules.append(schedule)


        plan.add_event(ServicePlanCreated(
            plan_id=plan.id,
            tenant_id=tenant_id,
            contract_id=contract_reference.contract_id,
            company_id=company_id,
        ))
        return plan

    # ------------------------------------------------------------------
    # DRAFT mutations
    # ------------------------------------------------------------------

    def update_schedules(self, schedules_payload: list[dict[str, Any]]) -> None:
        """
        Batch update of schedule details (CollectionPoint + Recurrence).
        Only allowed while the plan is in DRAFT status.
        Receives all schedules at once for transactional consistency (D6).
        """
        if self.status != ServicePlanStatus.DRAFT:
            raise ScheduleEditNotAllowedError(
                f"Cannot edit schedules on a plan with status {self.status.value}. "
                "Schedules can only be updated while the plan is DRAFT."
            )

        schedule_index = {s.id: s for s in self.schedules}

        for payload in schedules_payload:
            sid = uuid.UUID(str(payload["id"]))
            schedule = schedule_index.get(sid)
            if schedule is None:
                raise ScheduleNotFoundError(f"Schedule {sid} not found in this plan")

            if "collection_point" in payload and payload["collection_point"] is not None:
                cp = payload["collection_point"]
                schedule.set_collection_point(CollectionPoint(
                    address=cp.get("address", ""),
                    latitude=cp.get("latitude"),
                    longitude=cp.get("longitude"),
                    reference=cp.get("reference"),
                ))

            if "recurrence" in payload and payload["recurrence"] is not None:
                r = payload["recurrence"]
                schedule.set_recurrence(Recurrence(
                    frequency=RecurrenceFrequency(r["frequency"]),
                    interval=int(r.get("interval", 1)),
                    weekdays=[Weekday(w) for w in r.get("weekdays", [])],
                    start_time=_parse_time(r["start_time"]),
                    end_time=_parse_time(r["end_time"]),
                    timezone=r.get("timezone", "America/Sao_Paulo"),
                ))

            if "notes" in payload:
                schedule.notes = payload["notes"]

        self.updated_at = datetime.now(UTC)

    # ------------------------------------------------------------------
    # State machine
    # ------------------------------------------------------------------

    def publish(self) -> None:
        """
        DRAFT → ACTIVE.
        Validates that at least one ACTIVE schedule has CollectionPoint + Recurrence.
        Increments version for optimistic locking (D7).
        """
        if self.status != ServicePlanStatus.DRAFT:
            raise ServicePlanAlreadyPublishedError(
                f"Cannot publish a plan with status {self.status.value}"
            )

        ready_schedules = [s for s in self.schedules if s.is_ready_for_publish()]
        if not ready_schedules:
            raise ServicePlanHasNoReadySchedulesError(
                "publish() requires at least one ACTIVE schedule with "
                "a non-empty CollectionPoint and a Recurrence defined."
            )

        self.status = ServicePlanStatus.ACTIVE
        self.published_at = datetime.now(UTC)
        self.updated_at = self.published_at
        self.version += 1

        self.add_event(ServicePlanPublished(
            plan_id=self.id,
            tenant_id=self.tenant_id,
            contract_id=self.contract_reference.contract_id,
            company_id=self.company_id,
        ))

    def suspend(self) -> None:
        """ACTIVE → SUSPENDED."""
        if self.status != ServicePlanStatus.ACTIVE:
            raise InvalidPlanTransitionError(
                f"Cannot suspend a plan with status {self.status.value}"
            )
        self.status = ServicePlanStatus.SUSPENDED
        self.updated_at = datetime.now(UTC)
        self.version += 1
        self.add_event(ServicePlanSuspended(plan_id=self.id, tenant_id=self.tenant_id))

    def reactivate(self) -> None:
        """SUSPENDED → ACTIVE."""
        if self.status != ServicePlanStatus.SUSPENDED:
            raise InvalidPlanTransitionError(
                f"Cannot reactivate a plan with status {self.status.value}"
            )
        self.status = ServicePlanStatus.ACTIVE
        self.updated_at = datetime.now(UTC)
        self.version += 1

    def terminate(self) -> None:
        """Any non-TERMINATED → TERMINATED."""
        if self.status == ServicePlanStatus.TERMINATED:
            raise InvalidPlanTransitionError("Plan is already terminated")
        self.status = ServicePlanStatus.TERMINATED
        self.updated_at = datetime.now(UTC)
        self.version += 1

    # ------------------------------------------------------------------
    # Schedule management (via Aggregate Root — no ScheduleRepository)
    # ------------------------------------------------------------------

    def pause_schedule(self, schedule_id: uuid.UUID) -> None:
        schedule = self._find_schedule(schedule_id)
        schedule.pause()
        self.updated_at = datetime.now(UTC)

    def remove_schedule(self, schedule_id: uuid.UUID) -> None:
        schedule = self._find_schedule(schedule_id)
        schedule.remove()
        self.updated_at = datetime.now(UTC)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _find_schedule(self, schedule_id: uuid.UUID) -> ServiceSchedule:
        for s in self.schedules:
            if s.id == schedule_id:
                return s
        raise ScheduleNotFoundError(f"Schedule {schedule_id} not found in plan {self.id}")

    def active_schedules(self) -> list[ServiceSchedule]:
        return [s for s in self.schedules if s.status == ScheduleStatus.ACTIVE]


def _parse_time(value: str | None) -> time:
    """Parse 'HH:MM' or 'HH:MM:SS' string into datetime.time."""
    if not value:
        return time(8, 0)
    parts = value.split(":")
    return time(int(parts[0]), int(parts[1]))

