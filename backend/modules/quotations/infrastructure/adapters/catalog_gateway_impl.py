from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from modules.quotations.application.ports.catalog_gateway import CatalogGateway


class CatalogGatewayImpl(CatalogGateway):
    """
    Implementação concreta do ACL para buscar informações do Catalog (service name e uom name).
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_service_offering_name(self, offering_id: UUID) -> str:
        # A simple query bypassing full domain models for speed and decoupling
        stmt = text("SELECT name FROM catalog_service_offerings WHERE id = :id")
        result = await self.session.execute(stmt, {"id": offering_id})
        name = result.scalar_one_or_none()
        if not name:
            raise ValueError(f"Service offering {offering_id} not found in catalog")
        return name
        
    async def get_unit_of_measure_name(self, uom_id: UUID) -> str:
        stmt = text("SELECT symbol FROM catalog_unit_of_measures WHERE id = :id")
        result = await self.session.execute(stmt, {"id": uom_id})
        name = result.scalar_one_or_none()
        if not name:
            raise ValueError(f"UOM {uom_id} not found in catalog")
        return name
