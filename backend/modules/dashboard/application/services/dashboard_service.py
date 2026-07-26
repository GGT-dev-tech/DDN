from uuid import UUID

from modules.dashboard.application.dto.dashboard_dto import DashboardStatsResponse
from modules.dashboard.infrastructure.repositories.dashboard_read_repository import (
    IDashboardReadRepository,
)


class DashboardService:
    def __init__(self, read_repository: IDashboardReadRepository):
        self.read_repository = read_repository

    async def get_dashboard_stats(self, tenant_id: UUID) -> DashboardStatsResponse:
        stats = await self.read_repository.get_stats(tenant_id)
        return DashboardStatsResponse(**stats)
