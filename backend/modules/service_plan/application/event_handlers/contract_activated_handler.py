"""
Handler for ContractActivatedIntegrationEvent.

Listens to the public contract from the Contracts BC and creates a ServicePlan
in DRAFT status with one ServiceSchedule per contract item.

The plan is NOT automatically published — the operator must fill in
CollectionPoint + Recurrence and then call publish() via the API.
This is intentional because collection address and frequency data
do not exist in the contract yet (D5).
"""
from __future__ import annotations

from datetime import date

from modules.contracts.domain.integration_events import (
    ContractActivatedIntegrationEvent,
)
from modules.service_plan.application.services.service_plan_service import (
    ServicePlanService,
)


class ContractActivatedHandler:
    def __init__(self, service: ServicePlanService) -> None:
        self.service = service

    async def handle(self, event: ContractActivatedIntegrationEvent) -> None:
        expiration: date | None = None
        if event.expiration_date:
            expiration = date.fromisoformat(event.expiration_date)

        await self.service.create_from_contract(
            contract_id=event.contract_id,
            company_id=event.company_id,
            tenant_id=event.tenant_id,
            effective_date=date.fromisoformat(event.effective_date),
            expiration_date=expiration,
            items=event.items,
        )
