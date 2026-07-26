from typing import Protocol
from uuid import UUID


class CatalogGateway(Protocol):
    """
    Simples ACL para buscar informações do Catalog (service name e uom name)
    sem precisar instanciar os Services completos do módulo Catalog.
    """
    
    async def get_service_offering_name(self, offering_id: UUID) -> str:
        ...
        
    async def get_unit_of_measure_name(self, uom_id: UUID) -> str:
        ...
