from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db_session
from modules.dashboard.application.dto.dashboard_dto import DashboardStatsResponse
from modules.dashboard.application.services.dashboard_service import DashboardService
from modules.dashboard.infrastructure.repositories.dashboard_read_repository import (
    DashboardReadRepository,
)
from modules.identity.dependencies import require_tenant

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

def get_dashboard_service(db: AsyncSession = Depends(get_db_session)) -> DashboardService:
    repo = DashboardReadRepository(db)
    return DashboardService(repo)

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    tenant_id: UUID = Depends(require_tenant),
    service: DashboardService = Depends(get_dashboard_service)
):
    """
    Retrieves the main operational metrics for the current tenant's dashboard.
    """
    return await service.get_dashboard_stats(tenant_id)
