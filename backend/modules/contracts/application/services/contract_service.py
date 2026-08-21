import uuid
from datetime import date
from typing import Any

from modules.contracts.domain.entities.contract import Contract
from modules.contracts.domain.integration_events import ContractActivatedIntegrationEvent
from modules.contracts.domain.value_objects import ContractItemSnapshot, ContractTerm
from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository
from modules.core.application.integration_event_factory import IntegrationEventFactory
from shared_kernel.outbox.repository import OutboxRepository


class ContractService:
    def __init__(
        self,
        session: Any,
        repository: ContractRepository,
        outbox_repo: OutboxRepository,
        event_factory: IntegrationEventFactory,
    ) -> None:
        self.session = session
        self.repository = repository
        self.outbox_repo = outbox_repo
        self.event_factory = event_factory

    async def create_contract(
        self, 
        tenant_id: uuid.UUID,
        company_id: uuid.UUID, 
        quotation_id: uuid.UUID, 
        items_payload: list[dict[str, Any]],
        effective_date: date,
        mtr_id: uuid.UUID | None = None,
        destination_id: uuid.UUID | None = None,
        auto_generate_service_orders: bool = False
    ) -> uuid.UUID:
        
        # Determine terms
        terms = ContractTerm(effective_date=effective_date, expiration_date=None)
        
        # Create draft
        contract = Contract.create_draft(
            company_id=company_id, 
            tenant_id=tenant_id, 
            terms=terms, 
            quotation_id=quotation_id,
            mtr_id=mtr_id,
            destination_id=destination_id,
            auto_generate_service_orders=auto_generate_service_orders
        )
        
        # Populate initial version items based on payload from QuotationApproved
        current_version = contract.current_version
        
        for item_data in items_payload:
            snapshot = ContractItemSnapshot(
                service_name=item_data["snapshot"]["service_name"],
                unit_name=item_data["snapshot"]["unit_name"],
                base_unit_price=item_data["snapshot"]["base_unit_price"],
                total_base_price=item_data["snapshot"]["total_base_price"],
                surcharges_total=item_data["snapshot"]["surcharges_total"],
                discounts_total=item_data["snapshot"]["discounts_total"],
                final_price=item_data["snapshot"]["final_price"],
                pricing_reference=item_data["snapshot"].get("pricing_reference")
            )
            
            current_version.add_item(
                service_offering_id=item_data["service_offering_id"],
                unit_of_measure_id=item_data["unit_of_measure_id"],
                quantity=item_data["quantity"],
                snapshot=snapshot
            )
            
        await self.repository.save_contract(contract)
        
        # Domain events are internal and handled synchronously or within the BC
        # We don't push them to the Outbox.
        contract.clear_events()
        
        await self.session.commit()
        return contract.id

    async def send_for_signature(self, contract_id: uuid.UUID) -> None:
        contract = await self.repository.get_contract_by_id(contract_id)
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")
            
        contract.send_for_signature()
        
        await self.repository.save_contract(contract)
        contract.clear_events()
        await self.session.commit()

    async def activate_contract(self, contract_id: uuid.UUID) -> None:
        contract = await self.repository.get_contract_by_id(contract_id)
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")
            
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


        # Integration event goes into Outbox
        self.outbox_repo.save([integration_event])
        
        await self.repository.save_contract(contract)
        contract.clear_events()
        await self.session.commit()
