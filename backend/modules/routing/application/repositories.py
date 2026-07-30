from abc import ABC, abstractmethod
from uuid import UUID

from modules.routing.domain.entities.route import Route


class RoutingRepository(ABC):
    @abstractmethod
    async def save(self, route: Route) -> None:
        """Saves a route (insert or update)"""
        
    @abstractmethod
    async def get_by_id(self, route_id: UUID) -> Route | None:
        """Gets a route by its ID"""

    @abstractmethod
    def list_routes(self, tenant_id: UUID) -> list[Route]:
        """Gets all routes for a tenant"""
