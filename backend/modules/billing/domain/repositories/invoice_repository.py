import uuid
from typing import Protocol

from modules.billing.domain.entities.invoice import Invoice


class InvoiceRepository(Protocol):
    async def get_by_id(self, invoice_id: uuid.UUID) -> Invoice | None:
        ...

    async def get_by_tenant(self, tenant_id: uuid.UUID) -> list[Invoice]:
        ...

    async def save(self, invoice: Invoice) -> None:
        ...
