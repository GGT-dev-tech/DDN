import uuid

from pydantic import BaseModel

from modules.catalog.infrastructure.repositories.catalog_repository import CatalogRepository


class UOMResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    name: str
    base_type: str

class ListUOMs:
    def __init__(self, repository: CatalogRepository):
        self.repository = repository

    async def execute(self) -> list[UOMResponse]:
        uoms = await self.repository.list_uoms()
        return [
            UOMResponse(
                id=u.id,
                symbol=u.symbol,
                name=u.name,
                base_type=u.base_type.value
            )
            for u in uoms
        ]

class ServiceAttributeResponse(BaseModel):
    id: uuid.UUID
    name: str
    attribute_type: str
    is_required: bool
    possible_values: list[str] | None

class ListServiceAttributes:
    def __init__(self, repository: CatalogRepository):
        self.repository = repository

    async def execute(self, tenant_id: uuid.UUID) -> list[ServiceAttributeResponse]:
        attrs = await self.repository.list_service_attributes(tenant_id)
        return [
            ServiceAttributeResponse(
                id=a.id,
                name=a.name,
                attribute_type=a.attribute_type.value,
                is_required=a.is_required,
                possible_values=a.possible_values
            )
            for a in attrs
        ]

class ServiceOfferingAttributeResponse(BaseModel):
    service_attribute_id: uuid.UUID
    allowed_values: list[str] | None

class ServiceOfferingResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    category: str
    status: str
    default_uom_id: uuid.UUID
    attributes: list[ServiceOfferingAttributeResponse]

class ListServiceOfferings:
    def __init__(self, repository: CatalogRepository):
        self.repository = repository

    async def execute(self, tenant_id: uuid.UUID) -> list[ServiceOfferingResponse]:
        offerings = await self.repository.list_service_offerings(tenant_id)
        return [
            ServiceOfferingResponse(
                id=o.id,
                name=o.name,
                description=o.description,
                category=o.category,
                status=o.status.value,
                default_uom_id=o.default_uom_id,
                attributes=[
                    ServiceOfferingAttributeResponse(
                        service_attribute_id=a.service_attribute_id,
                        allowed_values=a.allowed_values
                    )
                    for a in o.attributes
                ]
            )
            for o in offerings
        ]
