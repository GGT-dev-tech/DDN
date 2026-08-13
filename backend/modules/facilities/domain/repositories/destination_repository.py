import abc
import uuid

from modules.facilities.domain.entities.destination import Destination


class DestinationRepository(abc.ABC):
    @abc.abstractmethod
    def save(self, destination: Destination) -> None:
        """Saves a new or existing destination."""
        pass

    @abc.abstractmethod
    def get_by_id(self, destination_id: uuid.UUID, tenant_id: uuid.UUID) -> Destination | None:
        """Retrieves a destination by its ID and Tenant."""
        pass

    @abc.abstractmethod
    def list_by_tenant(self, tenant_id: uuid.UUID, active_only: bool = True) -> list[Destination]:
        """Lists all destinations for a tenant."""
        pass
