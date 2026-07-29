"""
Service Plan — ServiceSchedule Entity.

Internal entity — no repository of its own (D6).
ALL mutations must go through the ServicePlan aggregate root.
Never instantiate or save ServiceSchedule outside of ServicePlan methods.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from modules.service_plan.domain.value_objects import (
    CollectionPoint,
    Recurrence,
    ScheduleStatus,
)


@dataclass
class ServiceSchedule:
    """
    Defines when and where a single contracted service will be executed.

    Lifecycle:
        - Created inside ServicePlan.create_from_contract() with collection_point=None
          and recurrence=None (DRAFT state — operator fills in before publish).
        - Edited via ServicePlan.update_schedules() while plan is DRAFT.
        - Immutable after ServicePlan.publish().

    status machine: ACTIVE → PAUSED → ACTIVE, ACTIVE/PAUSED → REMOVED
    """

    id: uuid.UUID
    service_offering_id: uuid.UUID
    service_name: str                        # immutable snapshot (D1)
    quantity_snapshot: Decimal = Decimal("0") # immutable snapshot — from ContractItem.quantity (D1)
    status: ScheduleStatus = ScheduleStatus.ACTIVE
    collection_point: CollectionPoint | None = None   # None until operator fills in
    recurrence: Recurrence | None = None              # None until operator fills in
    notes: str | None = None


    # ------------------------------------------------------------------
    # Status transitions
    # ------------------------------------------------------------------

    def pause(self) -> None:
        if self.status != ScheduleStatus.ACTIVE:
            raise ValueError(
                f"Cannot pause a schedule with status {self.status.value}"
            )
        self.status = ScheduleStatus.PAUSED

    def reactivate(self) -> None:
        if self.status != ScheduleStatus.PAUSED:
            raise ValueError(
                f"Cannot reactivate a schedule with status {self.status.value}"
            )
        self.status = ScheduleStatus.ACTIVE

    def remove(self) -> None:
        if self.status == ScheduleStatus.REMOVED:
            raise ValueError("Schedule is already removed")
        self.status = ScheduleStatus.REMOVED

    # ------------------------------------------------------------------
    # DRAFT-only mutations (enforced by ServicePlan.update_schedules)
    # ------------------------------------------------------------------

    def set_collection_point(self, point: CollectionPoint) -> None:
        self.collection_point = point

    def set_recurrence(self, recurrence: Recurrence) -> None:
        self.recurrence = recurrence

    # ------------------------------------------------------------------
    # Publish readiness
    # ------------------------------------------------------------------

    def is_ready_for_publish(self) -> bool:
        """
        A schedule is publish-ready when:
        - status is ACTIVE
        - collection_point is not None and has a non-empty address
        - recurrence is not None
        """
        if self.status != ScheduleStatus.ACTIVE:
            return False
        if self.collection_point is None or self.collection_point.is_empty():
            return False
        return self.recurrence is not None


    def to_dict(self) -> dict:
        """Serialise to dict for Integration Event payload."""
        return {
            "id": str(self.id),
            "service_offering_id": str(self.service_offering_id),
            "service_name": self.service_name,
            "quantity_snapshot": float(self.quantity_snapshot) if isinstance(self.quantity_snapshot, Decimal) else self.quantity_snapshot,  # for Routing BC
            "status": self.status.value,

            "collection_point": (
                {
                    "address": self.collection_point.address,
                    "latitude": self.collection_point.latitude,
                    "longitude": self.collection_point.longitude,
                    "reference": self.collection_point.reference,
                }
                if self.collection_point else None
            ),
            "recurrence": (
                {
                    "frequency": self.recurrence.frequency.value,
                    "interval": self.recurrence.interval,
                    "weekdays": [w.value for w in self.recurrence.weekdays],
                    "start_time": self.recurrence.start_time.isoformat(),
                    "end_time": self.recurrence.end_time.isoformat(),
                    "timezone": self.recurrence.timezone,
                }
                if self.recurrence else None
            ),
            "notes": self.notes,
        }
