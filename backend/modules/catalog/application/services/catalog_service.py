import uuid
from datetime import date
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from modules.core.infrastructure.uow import UnitOfWork

from modules.catalog.domain.entities.service_attribute import AttributeType, ServiceAttribute
from modules.catalog.domain.entities.service_offering import ServiceOffering
from modules.catalog.domain.entities.unit_of_measure import UnitOfMeasure, UOMBaseType
from modules.catalog.domain.events import (
    ServiceAttributeAttached,
    ServiceAttributeDefined,
    ServiceOfferingActivated,
    ServiceOfferingArchived,
    ServiceOfferingDrafted,
    UnitOfMeasureRegistered,
)
from modules.catalog.infrastructure.repositories.catalog_repository import CatalogRepository


class CatalogService:
    def __init__(self, uow: UnitOfWork, tenant_id: uuid.UUID, repo: CatalogRepository):
        self._uow = uow
        self._tenant_id = tenant_id
        self._repo = repo

    # --- Unit of Measure ---

    async def register_uom(self, symbol: str, name: str, base_type: UOMBaseType) -> uuid.UUID:
        async with self._uow as uow:
            existing = await self._repo.get_uom_by_symbol(self._tenant_id, symbol)
            if existing:
                raise ValueError(f"UOM with symbol {symbol} already exists")
    
            uom = UnitOfMeasure.create(
                tenant_id=self._tenant_id,
                symbol=symbol,
                name=name,
                base_type=base_type
            )
            
            event = UnitOfMeasureRegistered(
                uom_id=uom.id,
                tenant_id=self._tenant_id,
                symbol=uom.symbol,
                base_type=uom.base_type
            )
            uom.add_event(event)
    
            await self._repo.add_uom(uom)
            uom.clear_events()
            await uow.commit()
            
            return uom.id

    async def update_uom(self, uom_id: uuid.UUID, name: str) -> None:
        async with self._uow as uow:
            uom = await self._repo.get_uom_by_id(uom_id)
            if not uom:
                raise ValueError(f"UOM {uom_id} not found")
                
            uom.update(name=name)
            await self._repo.update_uom(uom)
            await uow.commit()

    # --- Service Attribute ---

    async def define_service_attribute(
        self,
        name: str,
        attribute_type: AttributeType,
        possible_values: list[Any],
        is_required: bool = False
    ) -> uuid.UUID:
        async with self._uow as uow:
            existing = await self._repo.get_service_attribute_by_name(name)
            if existing:
                raise ValueError(f"Service attribute with name '{name}' already exists")
    
            attr = ServiceAttribute.create(
                tenant_id=self._tenant_id,
                name=name,
                attribute_type=attribute_type,
                possible_values=possible_values,
                is_required=is_required
            )
            
            event = ServiceAttributeDefined(
                attribute_id=attr.id,
                tenant_id=self._tenant_id,
                name=attr.name,
                attribute_type=attr.attribute_type,
                is_required=attr.is_required
            )
            attr.add_event(event)
    
            await self._repo.add_service_attribute(attr)
            attr.clear_events()
            await uow.commit()
            
            return attr.id

    # --- Service Offering ---

    async def draft_service_offering(
        self,
        name: str,
        description: str,
        category: str,
        default_uom_id: uuid.UUID,
        effective_date: date,
        end_date: date | None = None
    ) -> uuid.UUID:
        async with self._uow as uow:
            existing = await self._repo.get_service_offering_by_name(name)
            if existing:
                raise ValueError(f"Service offering with name '{name}' already exists")
                
            uom = await self._repo.get_uom_by_id(default_uom_id)
            if not uom:
                raise ValueError(f"Default UOM {default_uom_id} not found")
    
            offering = ServiceOffering.draft(
                tenant_id=self._tenant_id,
                name=name,
                description=description,
                category=category,
                default_uom_id=default_uom_id,
                effective_date=effective_date,
                end_date=end_date
            )
            
            event = ServiceOfferingDrafted(
                offering_id=offering.id,
                tenant_id=self._tenant_id,
                name=offering.name,
                category=offering.category,
                default_uom_id=offering.default_uom_id,
                effective_date=offering.effective_date
            )
            offering.add_event(event)
    
            await self._repo.add_service_offering(offering)
            offering.clear_events()
            await uow.commit()
            
            return offering.id

    async def attach_attribute_to_service(
        self,
        offering_id: uuid.UUID,
        attribute_id: uuid.UUID,
        allowed_values: list[Any]
    ) -> None:
        async with self._uow as uow:
            offering = await self._repo.get_service_offering_by_id(offering_id)
            if not offering:
                raise ValueError(f"Service offering {offering_id} not found")
                
            attr = await self._repo.get_service_attribute_by_id(attribute_id)
            if not attr:
                raise ValueError(f"Service attribute {attribute_id} not found")
                
            # Validate that allowed_values is a subset of possible_values (assuming strings for simplicity)
            master_set = set(str(v) for v in attr.possible_values)
            for v in allowed_values:
                if str(v) not in master_set:
                    raise ValueError(f"Value '{v}' is not in master possible_values for attribute {attr.name}")
    
            offering.add_attribute(attribute_id, allowed_values)
            
            event = ServiceAttributeAttached(
                offering_id=offering.id,
                tenant_id=self._tenant_id,
                attribute_id=attribute_id,
                allowed_values=allowed_values
            )
            offering.add_event(event)
            
            await self._repo.update_service_offering(offering)
            offering.clear_events()
            await uow.commit()

    async def activate_service_offering(self, offering_id: uuid.UUID) -> None:
        async with self._uow as uow:
            offering = await self._repo.get_service_offering_by_id(offering_id)
            if not offering:
                raise ValueError(f"Service offering {offering_id} not found")
                
            offering.activate()
            
            event = ServiceOfferingActivated(
                offering_id=offering.id,
                tenant_id=self._tenant_id
            )
            offering.add_event(event)
            
            await self._repo.update_service_offering(offering)
            offering.clear_events()
            await uow.commit()

    async def update_service_offering(
        self,
        offering_id: uuid.UUID,
        name: str | None = None,
        description: str | None = None,
        category: str | None = None,
        effective_date: date | None = None,
        end_date: date | None = None
    ) -> None:
        async with self._uow as uow:
            offering = await self._repo.get_service_offering_by_id(offering_id)
            if not offering:
                raise ValueError(f"Service offering {offering_id} not found")
                
            offering.update(
                name=name,
                description=description,
                category=category,
                effective_date=effective_date,
                end_date=end_date
            )
            
            await self._repo.update_service_offering(offering)
            await uow.commit()

    async def archive_service_offering(self, offering_id: uuid.UUID) -> None:
        async with self._uow as uow:
            offering = await self._repo.get_service_offering_by_id(offering_id)
            if not offering:
                raise ValueError(f"Service offering {offering_id} not found")
                
            offering.archive()
            
            event = ServiceOfferingArchived(
                offering_id=offering.id,
                tenant_id=self._tenant_id
            )
            offering.add_event(event)
            
            await self._repo.update_service_offering(offering)
            offering.clear_events()
            await uow.commit()
