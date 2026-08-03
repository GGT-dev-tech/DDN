import abc
import uuid
from collections.abc import Sequence
from datetime import date

from modules.logistics.domain.entities.service_order import ServiceOrder


class ServiceOrderRepository(abc.ABC):
    @abc.abstractmethod
    async def save(self, order: ServiceOrder) -> None:
        """Saves a service order."""

    @abc.abstractmethod
    async def get_by_id(self, id: uuid.UUID) -> ServiceOrder | None:
        """Retrieves a service order by its ID."""

    @abc.abstractmethod
    async def get_by_tenant_and_date(
        self, tenant_id: uuid.UUID, scheduled_date: date
    ) -> Sequence[ServiceOrder]:
        """Retrieves all service orders for a given tenant and date."""
