from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID

from modules.commercial.domain.events import CompanyCreated
from modules.commercial.domain.exceptions import CompanyDocumentException
from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator


class CompanyStatus(Enum):
    PROSPECT = "PROSPECT"
    CUSTOMER = "CUSTOMER"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"

@dataclass
class Company(AggregateRoot):
    id: UUID
    tenant_id: UUID
    trade_name: str
    corporate_name: str
    document_number: str
    status: CompanyStatus
    created_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(cls, tenant_id: UUID, trade_name: str, corporate_name: str, document_number: str) -> "Company":
        if not document_number:
            raise CompanyDocumentException("document_number cannot be empty")
            
        company = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            trade_name=trade_name,
            corporate_name=corporate_name,
            document_number=document_number,
            status=CompanyStatus.PROSPECT
        )
        company.add_event(CompanyCreated(company_id=company.id, tenant_id=company.tenant_id))
        return company

    def activate_as_customer(self):
        self.status = CompanyStatus.CUSTOMER
