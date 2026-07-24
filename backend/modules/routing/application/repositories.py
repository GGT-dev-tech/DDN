from abc import ABC, abstractmethod
from uuid import UUID
from typing import Optional, List
from modules.routing.domain.entities.route import Route

class RoutingRepository(ABC):
    @abstractmethod
    def save(self, route: Route) -> None:
        """Saves a route (insert or update)"""
        pass
        
    @abstractmethod
    def get_by_id(self, route_id: UUID) -> Optional[Route]:
        """Gets a route by its ID"""
        pass
