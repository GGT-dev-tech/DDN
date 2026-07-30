from uuid import UUID

from modules.commercial.domain.entities.company import Company
from modules.commercial.infrastructure.repositories.company_repository import CompanyRepository


class CompanyService:
    def __init__(self, company_repo: CompanyRepository):
        self.company_repo = company_repo

    async def create_company(
        self,
        tenant_id: UUID,
        trade_name: str,
        corporate_name: str,
        document_number: str
    ) -> Company:
        # Check if company with this document already exists
        existing = await self.company_repo.get_by_document(tenant_id, document_number)
        if existing:
            # Domain would probably throw an exception here, but we will return it or raise
            raise ValueError(f"Company with document {document_number} already exists")
            
        company = Company.create(
            tenant_id=tenant_id,
            trade_name=trade_name,
            corporate_name=corporate_name,
            document_number=document_number
        )
        await self.company_repo.add(company)
        return company

    async def get_company(self, tenant_id: UUID, company_id: UUID) -> Company | None:
        return await self.company_repo.get_by_id(tenant_id, company_id)

    async def list_companies(self, tenant_id: UUID) -> list[Company]:
        return await self.company_repo.list_companies(tenant_id)
