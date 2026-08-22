from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.logistics.domain.entities.service_order import ServiceOrder
from modules.logistics.domain.repositories.service_order_repository import ServiceOrderRepository
from modules.contracts.domain.value_objects import ContractStatus
from modules.contracts.infrastructure.orm_models import ContractModel, ContractVersionModel, ContractItemModel, ContractItemSnapshotModel


class GenerateDailyOrdersService:
    def __init__(self, session: AsyncSession, service_order_repo: ServiceOrderRepository):
        self.session = session
        self.service_order_repo = service_order_repo

    async def execute(self, target_date: date) -> int:
        """
        Generates Service Orders for all active Contracts that have auto_generate_service_orders
        and match the schedule for the given target date (based on weekday).
        Returns the number of generated orders.
        """
        # Fetch active contracts with auto_generate_service_orders
        stmt = (
            select(ContractModel)
            .where(
                ContractModel.status == ContractStatus.ACTIVE,
                ContractModel.auto_generate_service_orders == True
            )
            .options(
                selectinload(ContractModel.versions).selectinload(ContractVersionModel.items).selectinload(ContractItemModel.snapshot)
            )
        )
        result = await self.session.execute(stmt)
        active_contracts = result.scalars().all()
        
        target_weekday = target_date.strftime("%A").upper()  # MONDAY, TUESDAY, etc.
        
        generated_count = 0
        for contract in active_contracts:
            if not contract.service_schedule or target_weekday not in contract.service_schedule:
                continue
            
            # Find current version
            if not contract.versions:
                continue
                
            current_version = max(contract.versions, key=lambda v: v.version_number)
            
            items_to_collect = []
            for item in current_version.items:
                if item.snapshot:
                    items_to_collect.append({
                        "service_offering_id": item.service_offering_id,
                        "service_name": item.snapshot.service_name,
                        "quantity": str(item.quantity),
                    })
                    
            if items_to_collect:
                # Check if an order already exists for this contract on this date
                existing_orders = await self.service_order_repo.get_by_tenant_and_date(
                    tenant_id=contract.tenant_id,
                    scheduled_date=target_date
                )
                
                already_generated = any(
                    # Using service_plan_id to store contract_id for now as it maps to the commercial agreement
                    o.service_plan_id == contract.id for o in existing_orders
                )
                
                if not already_generated:
                    order = ServiceOrder.create(
                        tenant_id=contract.tenant_id,
                        service_plan_id=contract.id, # Map service_plan_id to contract_id
                        company_id=contract.company_id,
                        scheduled_date=target_date,
                        items=items_to_collect,
                        destination_id=contract.destination_id
                    )
                    await self.service_order_repo.save(order)
                    generated_count += 1
                    
        return generated_count
