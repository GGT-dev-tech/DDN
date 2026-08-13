import uuid
from dataclasses import dataclass

from modules.contracts.domain.integration_events import ContractActivatedIntegrationEvent
from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository
from modules.core.application.integration_event_factory import IntegrationEventFactory
from modules.core.infrastructure.uow import UnitOfWork


@dataclass
class ActivateContractCommand:
    contract_id: uuid.UUID
    tenant_id: uuid.UUID


class ActivateContractHandler:
    def __init__(
        self,
        uow: UnitOfWork,
        repository: ContractRepository,
        event_factory: IntegrationEventFactory,
    ):
        self.uow = uow
        self.repository = repository
        self.event_factory = event_factory

    async def handle(self, command: ActivateContractCommand) -> None:
        async with self.uow as uow:
            # We fetch exactly what we need, filtered by tenant (closes BOLA/IDOR vulnerability)
            contract = await self.repository.get_contract_by_id_and_tenant(
                contract_id=command.contract_id,
                tenant_id=command.tenant_id
            )
            
            if not contract:
                raise ValueError(f"Contract {command.contract_id} not found or access denied")
                
            contract.activate()
            
            # Prepare Integration Event
            items_payload = []
            for item in contract.current_version.items:
                items_payload.append({
                    "service_offering_id": item.service_offering_id,
                    "unit_of_measure_id": item.unit_of_measure_id,
                    "quantity": str(item.quantity),
                    "service_name": item.snapshot.service_name,
                    "final_price": str(item.snapshot.final_price.amount)
                })
                
            metadata = self.event_factory.build_metadata(
                tenant_id=contract.tenant_id,
                causation_id=str(contract.id),
                aggregate_version=contract.version,
            )

            integration_event = ContractActivatedIntegrationEvent(
                metadata=metadata,
                contract_id=contract.id,
                tenant_id=contract.tenant_id,
                company_id=contract.company_id,
                effective_date=contract.terms.effective_date.isoformat(),
                expiration_date=(
                    contract.terms.expiration_date.isoformat()
                    if contract.terms.expiration_date else None
                ),
                items=items_payload,
            )
            
            # Since UOW manages the transaction, we just push it to the DB.
            # We don't commit here. UOW will commit.
            await self.repository.save_contract(contract)
            
            # The contract aggregate should hold its integration events.
            # Since the domain implementation might not collect this event automatically,
            # we can append it directly to the uow for dispatch if needed, or better,
            # let's just use the UoW directly.
            self.uow.events.append(integration_event)
            
            contract.clear_events()
            await uow.commit()
