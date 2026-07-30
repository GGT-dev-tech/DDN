from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from modules.commercial.domain.entities.company import Company
from modules.commercial.infrastructure.models import (
    CommercialCompany,
)


class CompanyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, company: Company) -> None:
        db_company = CommercialCompany(
            id=company.id,
            tenant_id=company.tenant_id,
            trade_name=company.trade_name,
            corporate_name=company.corporate_name,
            document_number=company.document_number,
            status=company.status,
            created_at=company.created_at
        )
        self.session.add(db_company)

    async def get_by_id(self, tenant_id: UUID, company_id: UUID) -> Company | None:
        stmt = select(CommercialCompany).where(
            CommercialCompany.tenant_id == tenant_id,
            CommercialCompany.id == company_id
        )
        result = await self.session.execute(stmt)
        db_company = result.scalar_one_or_none()
        
        if not db_company:
            return None
            
        company = Company(
            id=db_company.id,
            tenant_id=db_company.tenant_id,
            trade_name=db_company.trade_name,
            corporate_name=db_company.corporate_name,
            document_number=db_company.document_number,
            status=db_company.status,
            created_at=db_company.created_at
        )
        return company

    async def get_by_document(self, tenant_id: UUID, document_number: str) -> Company | None:
        stmt = select(CommercialCompany).where(
            CommercialCompany.tenant_id == tenant_id,
            CommercialCompany.document_number == document_number
        )
        result = await self.session.execute(stmt)
        db_company = result.scalar_one_or_none()
        
        if not db_company:
            return None
            
        company = Company(
            id=db_company.id,
            tenant_id=db_company.tenant_id,
            trade_name=db_company.trade_name,
            corporate_name=db_company.corporate_name,
            document_number=db_company.document_number,
            status=db_company.status,
            created_at=db_company.created_at
        )
        return company

    async def update(self, company: Company) -> None:
        stmt = select(CommercialCompany).where(
            CommercialCompany.tenant_id == company.tenant_id,
            CommercialCompany.id == company.id
        )
        result = await self.session.execute(stmt)
        db_company = result.scalar_one_or_none()
        if db_company:
            db_company.trade_name = company.trade_name
            db_company.corporate_name = company.corporate_name
            db_company.document_number = company.document_number
            db_company.status = company.status

    async def list_companies(self, tenant_id: UUID) -> list[Company]:
        stmt = select(CommercialCompany).where(
            CommercialCompany.tenant_id == tenant_id
        )
        result = await self.session.execute(stmt)
        db_companies = result.scalars().all()
        
        return [
            Company(
                id=c.id,
                tenant_id=c.tenant_id,
                trade_name=c.trade_name,
                corporate_name=c.corporate_name,
                document_number=c.document_number,
                status=c.status,
                created_at=c.created_at
            ) for c in db_companies
        ]
