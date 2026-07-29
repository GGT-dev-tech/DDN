"""
Service Plan — Repository Port (Protocol).

ServiceSchedule has NO repository of its own (D6).
All access to schedules is exclusively via ServicePlan.
"""
from __future__ import annotations

import uuid
from typing import Protocol

from modules.service_plan.domain.entities.service_plan import ServicePlan


class ServicePlanRepository(Protocol):
    async def save(self, plan: ServicePlan) -> None:
        """
        Persist or update a ServicePlan and its schedules.
        Implementors MUST enforce optimistic locking:
            UPDATE ... WHERE id = :id AND version = :expected_version
        Raise OptimisticLockError if 0 rows are affected.
        """
        ...

    async def get_by_id(self, plan_id: uuid.UUID) -> ServicePlan | None:
        """Retrieve a ServicePlan with all its schedules loaded."""
        ...

    async def list_by_contract(
        self, contract_id: uuid.UUID, tenant_id: uuid.UUID
    ) -> list[ServicePlan]:
        """
        Return all ServicePlans for a given contract within a tenant.
        A contract can originate multiple plans (phases, units, addenda).
        """
        ...
