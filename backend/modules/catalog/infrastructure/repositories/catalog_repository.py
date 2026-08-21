import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from modules.catalog.domain.entities.service_attribute import ServiceAttribute
from modules.catalog.domain.entities.service_offering import (
    ServiceOffering,
    ServiceOfferingAttribute,
)
from modules.catalog.domain.entities.unit_of_measure import UnitOfMeasure
from modules.catalog.infrastructure.orm_models import (
    CatalogServiceAttribute,
    CatalogServiceOffering,
    CatalogServiceOfferingAttribute,
    CatalogUnitOfMeasure,
)


class CatalogRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    # --- Unit of Measure ---
    
    async def add_uom(self, uom: UnitOfMeasure) -> None:
        orm_uom = CatalogUnitOfMeasure(
            id=uom.id,
            symbol=uom.symbol,
            name=uom.name,
            base_type=uom.base_type,
            created_at=uom.created_at,
            updated_at=uom.updated_at
        )
        self._session.add(orm_uom)

    async def get_uom_by_id(self, uom_id: uuid.UUID) -> UnitOfMeasure | None:
        result = await self._session.execute(
            select(CatalogUnitOfMeasure).where(CatalogUnitOfMeasure.id == uom_id)
        )
        orm = result.scalars().first()
        if not orm:
            return None
        return UnitOfMeasure(
            _id=orm.id,
            symbol=orm.symbol,
            name=orm.name,
            base_type=orm.base_type,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    async def get_uom_by_symbol(self, symbol: str) -> UnitOfMeasure | None:
        result = await self._session.execute(
            select(CatalogUnitOfMeasure).where(
                CatalogUnitOfMeasure.symbol == symbol
            )
        )
        orm = result.scalars().first()
        if not orm:
            return None
        return UnitOfMeasure(
            _id=orm.id,
            symbol=orm.symbol,
            name=orm.name,
            base_type=orm.base_type,
            created_at=orm.created_at,
            updated_at=orm.updated_at,
        )

    async def list_uoms(self) -> list[UnitOfMeasure]:
        result = await self._session.execute(
            select(CatalogUnitOfMeasure)
        )
        orms = result.scalars().all()
        return [
            UnitOfMeasure(
                _id=orm.id,
                symbol=orm.symbol,
                name=orm.name,
                base_type=orm.base_type,
                created_at=orm.created_at,
                updated_at=orm.updated_at,
            )
            for orm in orms
        ]

    # --- Service Attribute ---

    async def add_service_attribute(self, attr: ServiceAttribute) -> None:
        orm_attr = CatalogServiceAttribute(
            id=attr.id,
            tenant_id=attr.tenant_id,
            name=attr.name,
            attribute_type=attr.attribute_type,
            possible_values=attr.possible_values,
            is_required=attr.is_required,
            created_at=attr.created_at,
            updated_at=attr.updated_at
        )
        self._session.add(orm_attr)

    async def get_service_attribute_by_id(self, attr_id: uuid.UUID) -> ServiceAttribute | None:
        result = await self._session.execute(
            select(CatalogServiceAttribute).where(CatalogServiceAttribute.id == attr_id)
        )
        orm = result.scalars().first()
        if not orm:
            return None
        return ServiceAttribute(
            _id=orm.id,
            tenant_id=orm.tenant_id,
            name=orm.name,
            attribute_type=orm.attribute_type,
            possible_values=orm.possible_values,
            is_required=orm.is_required,
            created_at=orm.created_at,
            updated_at=orm.updated_at
        )

    async def get_service_attribute_by_name(self, name: str) -> ServiceAttribute | None:
        result = await self._session.execute(
            select(CatalogServiceAttribute).where(CatalogServiceAttribute.name == name)
        )
        orm = result.scalars().first()
        if not orm:
            return None
        return await self.get_service_attribute_by_id(orm.id)

    async def list_service_attributes(self, tenant_id: uuid.UUID) -> list[ServiceAttribute]:
        result = await self._session.execute(
            select(CatalogServiceAttribute).where(CatalogServiceAttribute.tenant_id == tenant_id)
        )
        orms = result.scalars().all()
        return [
            ServiceAttribute(
                _id=orm.id,
                tenant_id=orm.tenant_id,
                name=orm.name,
                attribute_type=orm.attribute_type,
                possible_values=orm.possible_values,
                is_required=orm.is_required,
                created_at=orm.created_at,
                updated_at=orm.updated_at
            )
            for orm in orms
        ]

    # --- Service Offering ---

    async def add_service_offering(self, offering: ServiceOffering) -> None:
        orm_offering = CatalogServiceOffering(
            id=offering.id,
            tenant_id=offering.tenant_id,
            name=offering.name,
            description=offering.description,
            category=offering.category,
            status=offering.status,
            default_uom_id=offering.default_uom_id,
            effective_date=offering.effective_date,
            end_date=offering.end_date,
            created_at=offering.created_at,
            updated_at=offering.updated_at
        )
        self._session.add(orm_offering)
        
        # Add associations
        for attr in offering.attributes:
            orm_attr = CatalogServiceOfferingAttribute(
                service_offering_id=offering.id,
                service_attribute_id=attr.service_attribute_id,
                allowed_values=attr.allowed_values
            )
            # Tenant ID is handled implicitly by RLS / TenantScopedEntity on flush, 
            # but we explicitly set it here to be safe if required by DB.
            orm_attr.tenant_id = offering.tenant_id
            self._session.add(orm_attr)

    async def get_service_offering_by_id(self, offering_id: uuid.UUID) -> ServiceOffering | None:
        result = await self._session.execute(
            select(CatalogServiceOffering).where(CatalogServiceOffering.id == offering_id)
        )
        orm = result.scalars().first()
        if not orm:
            return None
            
        attr_result = await self._session.execute(
            select(CatalogServiceOfferingAttribute)
            .where(CatalogServiceOfferingAttribute.service_offering_id == offering_id)
        )
        orm_attrs = attr_result.scalars().all()
        
        attributes = [
            ServiceOfferingAttribute(
                service_offering_id=a.service_offering_id,
                service_attribute_id=a.service_attribute_id,
                allowed_values=a.allowed_values
            ) for a in orm_attrs
        ]
        
        return ServiceOffering(
            _id=orm.id,
            tenant_id=orm.tenant_id,
            name=orm.name,
            description=orm.description,
            category=orm.category,
            status=orm.status,
            default_uom_id=orm.default_uom_id,
            effective_date=orm.effective_date,
            end_date=orm.end_date,
            attributes=attributes,
            created_at=orm.created_at,
            updated_at=orm.updated_at
        )

    async def get_service_offering_by_name(self, name: str) -> ServiceOffering | None:
        result = await self._session.execute(
            select(CatalogServiceOffering).where(CatalogServiceOffering.name == name)
        )
        orm = result.scalars().first()
        if not orm:
            return None
        return await self.get_service_offering_by_id(orm.id)

    async def list_service_offerings(self, tenant_id: uuid.UUID) -> list[ServiceOffering]:
        result = await self._session.execute(
            select(CatalogServiceOffering).where(CatalogServiceOffering.tenant_id == tenant_id)
        )
        orms = result.scalars().all()
        offerings = []
        for orm in orms:
            offerings.append(await self.get_service_offering_by_id(orm.id))
        return [o for o in offerings if o is not None]

    async def update_service_offering(self, offering: ServiceOffering) -> None:
        result = await self._session.execute(
            select(CatalogServiceOffering).where(CatalogServiceOffering.id == offering.id)
        )
        orm = result.scalars().first()
        if not orm:
            raise ValueError(f"ServiceOffering {offering.id} not found")
            
        orm.name = offering.name
        orm.description = offering.description
        orm.category = offering.category
        orm.status = offering.status
        orm.default_uom_id = offering.default_uom_id
        orm.effective_date = offering.effective_date
        orm.end_date = offering.end_date
        orm.updated_at = offering.updated_at
        
        # Simplified attribute update for Draft (delete all existing and recreate)
        # Note: In production, you might want more granular merges for active items.
        delete_stmt = (
            CatalogServiceOfferingAttribute.__table__.delete()
            .where(CatalogServiceOfferingAttribute.service_offering_id == offering.id)
        )
        await self._session.execute(delete_stmt)
        
        for attr in offering.attributes:
            orm_attr = CatalogServiceOfferingAttribute(
                service_offering_id=offering.id,
                service_attribute_id=attr.service_attribute_id,
                allowed_values=attr.allowed_values
            )
            orm_attr.tenant_id = offering.tenant_id
            self._session.add(orm_attr)
