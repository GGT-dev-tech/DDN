import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from modules.contracts.infrastructure.orm_models import ContractModel


class ListContractsQueryHandler:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def handle(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[dict[str, Any]]:
        # CQRS READ MODEL: Bypasses domain entities completely.
        # Queries exactly what the frontend needs directly from the DB.
        # No N+1 queries. No heavy hydration of Aggregates.
        
        stmt = (
            select(
                ContractModel.id,
                ContractModel.status,
                ContractModel.company_id,
                ContractModel.effective_date,
                ContractModel.expiration_date,
                ContractModel.mtr_id,
                ContractModel.destination_id,
                ContractModel.auto_generate_service_orders
            )
            .where(ContractModel.tenant_id == tenant_id)
            .order_by(ContractModel.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        
        result = await self.session.execute(stmt)
        rows = result.all()
        
        # Returns flattened DTOs directly
        return [
            {
                "id": str(row.id),
                "status": row.status,
                "company_id": str(row.company_id),
                "effective_date": row.effective_date.isoformat() if row.effective_date else None,
                "expiration_date": row.expiration_date.isoformat() if row.expiration_date else None,
                "mtr_id": str(row.mtr_id) if row.mtr_id else None,
                "destination_id": str(row.destination_id) if row.destination_id else None,
                "auto_generate_service_orders": row.auto_generate_service_orders,
            }
            for row in rows
        ]
