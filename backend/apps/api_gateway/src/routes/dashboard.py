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

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

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

from pydantic import BaseModel

class DestinationEvolutionChartData(BaseModel):
    name: str
    reciclavel: float
    organico: float
    rejeito: float

@router.get("/chart/destination-evolution", response_model=list[DestinationEvolutionChartData])
async def get_destination_evolution_chart(
    tenant_id: UUID = Depends(require_tenant),
):
    """
    Mock endpoint for destination evolution chart data.
    """
    return [
        { "name": "JAN", "reciclavel": 120, "organico": 80, "rejeito": 30 },
        { "name": "FEV", "reciclavel": 135, "organico": 75, "rejeito": 35 },
        { "name": "MAR", "reciclavel": 150, "organico": 105, "rejeito": 25 },
        { "name": "ABR", "reciclavel": 180, "organico": 90, "rejeito": 45 },
        { "name": "MAI", "reciclavel": 165, "organico": 120, "rejeito": 30 },
        { "name": "JUN", "reciclavel": 210, "organico": 60, "rejeito": 15 }
    ]
