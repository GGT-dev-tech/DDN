# mypy: ignore-errors
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from modules.contracts.domain.entities.contract import Contract
from modules.contracts.domain.entities.version import ContractItem, ContractVersion
from modules.contracts.domain.value_objects import (
    ContractItemSnapshot,
    ContractTerm,
    Money,
)
from modules.contracts.infrastructure.orm_models import (
    ContractItemModel,
    ContractItemSnapshotModel,
    ContractModel,
    ContractVersionModel,
)


class ContractRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_contracts(self, tenant_id: uuid.UUID) -> list[Contract]:
        stmt = (
            select(ContractModel)
            .options(
                selectinload(ContractModel.versions)
                .selectinload(ContractVersionModel.items)
                .selectinload(ContractItemModel.snapshot)
            )
            .where(ContractModel.tenant_id == tenant_id)
            .order_by(ContractModel.created_at.desc())
        )
        
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        contracts = []
        for model in models:
            terms = ContractTerm(
                effective_date=model.effective_date,
                expiration_date=model.expiration_date,
                renewal_rule=model.renewal_rule,
                adjustment_rule=model.adjustment_rule
            )
                
            contract = Contract(  # type: ignore 
                company_id=model.company_id,
                tenant_id=model.tenant_id,
                terms=terms,
                quotation_id=model.quotation_id,
                mtr_id=model.mtr_id,
                destination_id=model.destination_id,
                auto_generate_service_orders=model.auto_generate_service_orders,
                id=model.id,
                status=model.status,
                created_at=model.created_at,
                updated_at=model.updated_at
            )
            
            for version_model in model.versions:
                version = ContractVersion(
                    version_number=version_model.version_number,
                    id=version_model.id,
                    created_at=version_model.created_at
                )
                
                for item_model in version_model.items:
                    snapshot = None
                    if item_model.snapshot:
                        snapshot = ContractItemSnapshot(  # type: ignore 
                            service_name=item_model.snapshot.service_name,
                            unit_name=item_model.snapshot.unit_name,
                            base_unit_price=Money(item_model.snapshot.base_unit_price, item_model.snapshot.currency),
                            total_base_price=Money(item_model.snapshot.total_base_price, item_model.snapshot.currency),
                            surcharges_total=Money(item_model.snapshot.surcharges_total, item_model.snapshot.currency),
                            discounts_total=Money(item_model.snapshot.discounts_total, item_model.snapshot.currency),
                            final_price=Money(item_model.snapshot.final_price, item_model.snapshot.currency),
                            pricing_reference=item_model.snapshot.pricing_reference
                        )
                        
                    item = ContractItem(
                        id=item_model.id,
                        service_offering_id=item_model.service_offering_id,
                        unit_of_measure_id=item_model.unit_of_measure_id,
                        quantity=item_model.quantity,
                        snapshot=snapshot
                    )
                    version.items.append(item)
                    
                contract.versions.append(version)
            
            contracts.append(contract)
            
        return contracts

    async def get_contract_by_id(self, contract_id: uuid.UUID) -> Contract | None:
        stmt = (
            select(ContractModel)
            .options(
                selectinload(ContractModel.versions)
                .selectinload(ContractVersionModel.items)
                .selectinload(ContractItemModel.snapshot)
            )
            .where(ContractModel.id == contract_id)
        )
        
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            return None
            
        terms = ContractTerm(
            effective_date=model.effective_date,
            expiration_date=model.expiration_date,
            renewal_rule=model.renewal_rule,
            adjustment_rule=model.adjustment_rule
        )
            
        contract = Contract(  # type: ignore 
            company_id=model.company_id,
            tenant_id=model.tenant_id,
            terms=terms,
            quotation_id=model.quotation_id,
            mtr_id=model.mtr_id,
            destination_id=model.destination_id,
            auto_generate_service_orders=model.auto_generate_service_orders,
            id=model.id,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
        
        for version_model in model.versions:
            version = ContractVersion(
                version_number=version_model.version_number,
                id=version_model.id,
                created_at=version_model.created_at
            )
            
            for item_model in version_model.items:
                snapshot = None
                if item_model.snapshot:
                    snapshot = ContractItemSnapshot(  # type: ignore 
                        service_name=item_model.snapshot.service_name,
                        unit_name=item_model.snapshot.unit_name,
                        base_unit_price=Money(item_model.snapshot.base_unit_price, item_model.snapshot.currency),
                        total_base_price=Money(item_model.snapshot.total_base_price, item_model.snapshot.currency),
                        surcharges_total=Money(item_model.snapshot.surcharges_total, item_model.snapshot.currency),
                        discounts_total=Money(item_model.snapshot.discounts_total, item_model.snapshot.currency),
                        final_price=Money(item_model.snapshot.final_price, item_model.snapshot.currency),
                        pricing_reference=item_model.snapshot.pricing_reference
                    )
                    
                item = ContractItem(
                    id=item_model.id,
                    service_offering_id=item_model.service_offering_id,
                    unit_of_measure_id=item_model.unit_of_measure_id,
                    quantity=item_model.quantity,
                    snapshot=snapshot
                )
                version.items.append(item)
                
            contract.versions.append(version)
            
        return contract

    async def save_contract(self, contract: Contract) -> None:
        model = await self.session.get(ContractModel, contract.id)
        
        if not model:
            model = ContractModel(
                id=contract.id,
                tenant_id=contract.tenant_id,
                company_id=contract.company_id,
                quotation_id=contract.quotation_id,
                mtr_id=contract.mtr_id,
                destination_id=contract.destination_id,
                auto_generate_service_orders=contract.auto_generate_service_orders,
                status=contract.status,
                effective_date=contract.terms.effective_date,
                expiration_date=contract.terms.expiration_date,
                renewal_rule=contract.terms.renewal_rule,
                adjustment_rule=contract.terms.adjustment_rule,
                created_at=contract.created_at,
                updated_at=contract.updated_at
            )
            self.session.add(model)
        else:
            model.status = contract.status
            model.effective_date = contract.terms.effective_date
            model.expiration_date = contract.terms.expiration_date
            model.renewal_rule = contract.terms.renewal_rule
            model.adjustment_rule = contract.terms.adjustment_rule
            model.mtr_id = contract.mtr_id
            model.destination_id = contract.destination_id
            model.auto_generate_service_orders = contract.auto_generate_service_orders
            model.updated_at = contract.updated_at
            
        # Handle Versions
        existing_versions = {v.id: v for v in await self._get_existing_versions(contract.id)}
        
        for version in contract.versions:
            if version.id not in existing_versions:
                version_model = ContractVersionModel(
                    id=version.id,
                    tenant_id=contract.tenant_id,
                    contract_id=contract.id,
                    version_number=version.version_number,
                    created_at=version.created_at
                )
                self.session.add(version_model)
                
            # Handle Items for this version
            existing_items = {i.id: i for i in await self._get_existing_items(version.id)}
            
            for item in version.items:
                if item.id in existing_items:
                    item_model = existing_items[item.id]
                    item_model.service_offering_id = item.service_offering_id
                    item_model.unit_of_measure_id = item.unit_of_measure_id
                    item_model.quantity = item.quantity
                else:
                    item_model = ContractItemModel(
                        id=item.id,
                        tenant_id=contract.tenant_id,
                        version_id=version.id,
                        service_offering_id=item.service_offering_id,
                        unit_of_measure_id=item.unit_of_measure_id,
                        quantity=item.quantity
                    )
                    self.session.add(item_model)
                    
                # Handle Snapshot
                if item.snapshot:
                    snapshot_model = await self.session.get(ContractItemSnapshotModel, item.id)
                    if not snapshot_model:
                        snapshot_model = ContractItemSnapshotModel(
                            id=item.id,
                            tenant_id=contract.tenant_id,
                            contract_item_id=item.id,
                            service_name=item.snapshot.service_name,
                            unit_name=item.snapshot.unit_name,
                            base_unit_price=item.snapshot.base_unit_price.amount,
                            total_base_price=item.snapshot.total_base_price.amount,
                            surcharges_total=item.snapshot.surcharges_total.amount,
                            discounts_total=item.snapshot.discounts_total.amount,
                            final_price=item.snapshot.final_price.amount,
                            currency=item.snapshot.final_price.currency,
                            pricing_reference=item.snapshot.pricing_reference,
                            created_at=datetime.now(UTC)
                        )
                        self.session.add(snapshot_model)

    async def _get_existing_versions(self, contract_id: uuid.UUID) -> list[ContractVersionModel]:
        stmt = select(ContractVersionModel).where(ContractVersionModel.contract_id == contract_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def _get_existing_items(self, version_id: uuid.UUID) -> list[ContractItemModel]:
        stmt = select(ContractItemModel).where(ContractItemModel.version_id == version_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
