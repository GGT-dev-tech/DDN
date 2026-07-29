from abc import ABC, abstractmethod
from uuid import UUID

from modules.routing.domain.entities.route import Route


class RoutingRepository(ABC):
    @abstractmethod
    def save(self, route: Route) -> None:
        """Saves a route (insert or update)"""
        
    @abstractmethod
    def get_by_id(self, route_id: UUID) -> Route | None:
        """Gets a route by its ID"""

    @abstractmethod
    def list_routes(self) -> list[Route]:
        """Gets all routes"""
