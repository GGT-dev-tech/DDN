"""
Service Plan Application Service.

Orchestrates use cases for the Service Plan BC.
All Integration Events are produced via IntegrationEventFactory (no uuid4() direct calls).
"""
from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.service_plan.application.ports.service_plan_repository import (
    ServicePlanRepository,
)
from modules.service_plan.domain.entities.service_plan import ServicePlan
from modules.service_plan.domain.exceptions import ServicePlanNotFoundError
from modules.service_plan.domain.integration_events import (
    ServicePlanPublished as ServicePlanPublishedEvent,
)
from modules.service_plan.domain.integration_events import (
    ServicePlanSuspended as ServicePlanSuspendedEvent,
)
from modules.service_plan.domain.value_objects import ContractReference
from shared_kernel.outbox.repository import OutboxRepository


class ServicePlanService:
    def __init__(
        self,
        session: Any,
        repository: ServicePlanRepository,
        outbox_repo: OutboxRepository,
        event_factory: IntegrationEventFactory,
    ) -> None:
        self.session = session
        self.repository = repository
        self.outbox_repo = outbox_repo
        self.event_factory = event_factory

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    async def create_from_contract(
        self,
        contract_id: uuid.UUID,
        company_id: uuid.UUID,
        tenant_id: uuid.UUID,
        effective_date: date,
        items: list[dict[str, Any]],
        expiration_date: date | None = None,
    ) -> uuid.UUID:
        plan = ServicePlan.create_from_contract(
            contract_reference=ContractReference(contract_id=contract_id),
            tenant_id=tenant_id,
            company_id=company_id,
            effective_date=effective_date,
            expiration_date=expiration_date,
            items=items,
        )
        await self.repository.save(plan)
        plan.clear_events()
        await self.session.commit()
        return plan.id

    async def update_schedules(
        self,
        plan_id: uuid.UUID,
        schedules_payload: list[dict[str, Any]],
    ) -> None:
        """
        Batch update of all schedules in one transactional operation.
        Only allowed while plan is DRAFT.
        """
        plan = await self._require_plan(plan_id)
        plan.update_schedules(schedules_payload)
        await self.repository.save(plan)
        plan.clear_events()
        await self.session.commit()

    async def publish(self, plan_id: uuid.UUID) -> None:
        plan = await self._require_plan(plan_id)
        plan.publish()

        metadata = self.event_factory.build_metadata(
            tenant_id=plan.tenant_id,
            causation_id=str(plan.id),
            aggregate_version=plan.version,
        )
        integration_event = ServicePlanPublishedEvent(
            metadata=metadata,
            plan_id=plan.id,
            tenant_id=plan.tenant_id,
            company_id=plan.company_id,
            contract_id=plan.contract_reference.contract_id,
            effective_date=plan.effective_date.isoformat(),
            expiration_date=(
                plan.expiration_date.isoformat() if plan.expiration_date else None
            ),
            schedules=[s.to_dict() for s in plan.active_schedules()],
        )
        self.outbox_repo.save([integration_event])
        await self.repository.save(plan)
        plan.clear_events()
        await self.session.commit()

    async def suspend(self, plan_id: uuid.UUID) -> None:
        plan = await self._require_plan(plan_id)
        plan.suspend()

        metadata = self.event_factory.build_metadata(
            tenant_id=plan.tenant_id,
            causation_id=str(plan.id),
            aggregate_version=plan.version,
        )
        integration_event = ServicePlanSuspendedEvent(
            metadata=metadata,
            plan_id=plan.id,
            tenant_id=plan.tenant_id,
            company_id=plan.company_id,
            contract_id=plan.contract_reference.contract_id,
        )
        self.outbox_repo.save([integration_event])
        await self.repository.save(plan)
        plan.clear_events()
        await self.session.commit()

    async def reactivate(self, plan_id: uuid.UUID) -> None:
        plan = await self._require_plan(plan_id)
        plan.reactivate()
        await self.repository.save(plan)
        plan.clear_events()
        await self.session.commit()

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    async def get_plan_by_id(self, plan_id: uuid.UUID) -> ServicePlan:
        return await self._require_plan(plan_id)

    async def list_plans_by_contract(
        self, contract_id: uuid.UUID, tenant_id: uuid.UUID
    ) -> list[ServicePlan]:
        return await self.repository.list_by_contract(contract_id, tenant_id)

    async def list_all(
        self, tenant_id: uuid.UUID
    ) -> list[ServicePlan]:
        return await self.repository.list_all(tenant_id)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _require_plan(self, plan_id: uuid.UUID) -> ServicePlan:
        plan = await self.repository.get_by_id(plan_id)
        if plan is None:
            raise ServicePlanNotFoundError(f"ServicePlan {plan_id} not found")
        return plan
