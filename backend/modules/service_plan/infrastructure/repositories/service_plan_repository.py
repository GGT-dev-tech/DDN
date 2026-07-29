# mypy: ignore-errors
"""
Service Plan — SQLAlchemy Repository Implementation.

Implements the ServicePlanRepository Protocol.
Enforces optimistic locking on save() via version column comparison.
"""
from __future__ import annotations

import uuid
from datetime import time
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from modules.service_plan.domain.entities.schedule import ServiceSchedule
from modules.service_plan.domain.entities.service_plan import ServicePlan
from modules.service_plan.domain.exceptions import OptimisticLockError
from modules.service_plan.domain.value_objects import (
    CollectionPoint,
    ContractReference,
    Recurrence,
    RecurrenceFrequency,
    ScheduleStatus,
    ServicePlanStatus,
    Weekday,
)
from modules.service_plan.infrastructure.orm_models import (
    ServicePlanModel,
    ServiceScheduleModel,
)


class SQLAlchemyServicePlanRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def save(self, plan: ServicePlan) -> None:
        """
        Upsert strategy:
        - Try to load existing model.
        - If not found → INSERT (new plan).
        - If found → UPDATE with WHERE version = expected_version (optimistic lock).
        """
        result = await self.session.get(ServicePlanModel, plan.id)

        if result is None:
            model = self._to_model(plan)
            self.session.add(model)
            plan._original_version = plan.version
            return

        stmt = (

            update(ServicePlanModel)
            .where(
                ServicePlanModel.id == plan.id,
                # Compare against the version that was loaded from DB (_original_version).
                # Using plan.version would fail for update_schedules() which doesn't
                # increment version — both reads would see the same value.
                ServicePlanModel.version == plan._original_version,
            )
            .values(
                version=plan.version,
                status=plan.status,
                effective_date=plan.effective_date,
                expiration_date=plan.expiration_date,
                published_at=plan.published_at,
                updated_at=plan.updated_at,
            )
            .execution_options(synchronize_session=False)
        )
        exec_result = await self.session.execute(stmt)

        if exec_result.rowcount == 0:
            raise OptimisticLockError(
                f"ServicePlan {plan.id} was modified concurrently. "
                f"DB version != expected {plan._original_version}. Refresh and retry."
            )


        # Sync schedules: delete + re-insert to keep it simple and correct.
        await self.session.execute(
            __import__("sqlalchemy", fromlist=["delete"]).delete(ServiceScheduleModel)
            .where(ServiceScheduleModel.plan_id == plan.id)
        )
        for schedule in plan.schedules:
            self.session.add(self._schedule_to_model(plan.id, schedule))
            
        # Update the aggregate's tracking version so subsequent saves on this
        # same instance in the same transaction/session don't falsely trigger conflicts.
        plan._original_version = plan.version


    def _parse_time(self, value: str) -> time:
        parts = value.split(":")
        return time(int(parts[0]), int(parts[1]))

    async def get_by_id(self, plan_id: uuid.UUID) -> ServicePlan | None:
        result = await self.session.get(ServicePlanModel, plan_id)
        if result is None:
            return None
        return self._to_domain(result)

    async def list_by_contract(
        self, contract_id: uuid.UUID, tenant_id: uuid.UUID
    ) -> list[ServicePlan]:
        stmt = select(ServicePlanModel).where(
            ServicePlanModel.contract_id == contract_id,
            ServicePlanModel.tenant_id == tenant_id,
        )
        result = await self.session.execute(stmt)
        return [self._to_domain(m) for m in result.scalars().all()]

    # ------------------------------------------------------------------
    # Mapping helpers
    # ------------------------------------------------------------------

    def _to_model(self, plan: ServicePlan) -> ServicePlanModel:
        model = ServicePlanModel(
            id=plan.id,
            version=plan.version,
            tenant_id=plan.tenant_id,
            company_id=plan.company_id,
            contract_id=plan.contract_reference.contract_id,
            status=plan.status,
            effective_date=plan.effective_date,
            expiration_date=plan.expiration_date,
            published_at=plan.published_at,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
        )
        model.schedules = [self._schedule_to_model(plan.id, s) for s in plan.schedules]
        return model

    def _schedule_to_model(
        self, plan_id: uuid.UUID, schedule: ServiceSchedule
    ) -> ServiceScheduleModel:
        cp: dict[str, Any] | None = None
        if schedule.collection_point is not None:
            cp = {
                "address": schedule.collection_point.address,
                "latitude": schedule.collection_point.latitude,
                "longitude": schedule.collection_point.longitude,
                "reference": schedule.collection_point.reference,
            }

        rec: dict[str, Any] | None = None
        if schedule.recurrence is not None:
            rec = {
                "frequency": schedule.recurrence.frequency.value,
                "interval": schedule.recurrence.interval,
                "weekdays": [w.value for w in schedule.recurrence.weekdays],
                "start_time": schedule.recurrence.start_time.isoformat(),
                "end_time": schedule.recurrence.end_time.isoformat(),
                "timezone": schedule.recurrence.timezone,
            }

        return ServiceScheduleModel(
            id=schedule.id,
            plan_id=plan_id,
            service_offering_id=schedule.service_offering_id,
            service_name=schedule.service_name,
            quantity_snapshot=schedule.quantity_snapshot,
            collection_point=cp,
            recurrence=rec,
            status=schedule.status,
            notes=schedule.notes,
        )


    def _to_domain(self, model: ServicePlanModel) -> ServicePlan:
        schedules = [self._schedule_to_domain(s) for s in (model.schedules or [])]
        return ServicePlan(
            id=model.id,
            version=model.version,
            tenant_id=model.tenant_id,
            company_id=model.company_id,
            contract_reference=ContractReference(contract_id=model.contract_id),
            status=ServicePlanStatus(model.status),
            effective_date=model.effective_date,
            expiration_date=model.expiration_date,
            published_at=model.published_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
            schedules=schedules,
        )

    def _schedule_to_domain(self, model: ServiceScheduleModel) -> ServiceSchedule:
        cp: CollectionPoint | None = None
        if model.collection_point:
            cp = CollectionPoint(
                address=model.collection_point.get("address", ""),
                latitude=model.collection_point.get("latitude"),
                longitude=model.collection_point.get("longitude"),
                reference=model.collection_point.get("reference"),
            )

        rec: Recurrence | None = None
        if model.recurrence:
            from datetime import time
            parts_s = model.recurrence["start_time"].split(":")
            parts_e = model.recurrence["end_time"].split(":")
            rec = Recurrence(
                frequency=RecurrenceFrequency(model.recurrence["frequency"]),
                interval=model.recurrence.get("interval", 1),
                weekdays=[Weekday(w) for w in model.recurrence.get("weekdays", [])],
                start_time=time(int(parts_s[0]), int(parts_s[1])),
                end_time=time(int(parts_e[0]), int(parts_e[1])),
                timezone=model.recurrence.get("timezone", "America/Sao_Paulo"),
            )

        return ServiceSchedule(
            id=model.id,
            service_offering_id=model.service_offering_id,
            service_name=model.service_name,
            quantity_snapshot=getattr(model, "quantity_snapshot", "0") or "0",
            status=ScheduleStatus(model.status),
            collection_point=cp,
            recurrence=rec,
            notes=model.notes,
        )
