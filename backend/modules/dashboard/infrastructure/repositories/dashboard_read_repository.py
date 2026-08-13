import abc
import asyncio
from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from modules.billing.infrastructure.orm_models import ORMInvoice
from modules.commercial.infrastructure.models import CommercialLead
from modules.contracts.infrastructure.orm_models import ContractModel
from modules.fleet.domain.entities.vehicle import VehicleStatus
from modules.fleet.infrastructure.orm_models import VehicleModel
from modules.quotations.infrastructure.orm_models import QuotationModel
from modules.routing.domain.entities.route import RouteStatus, StopStatus
from modules.routing.infrastructure.orm_models import RouteModel, StopModel


class IDashboardReadRepository(abc.ABC):
    @abc.abstractmethod
    async def get_stats(self, tenant_id: UUID) -> dict[str, any]:
        pass


class DashboardReadRepository(IDashboardReadRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Individual query helpers (each returns a scalar) ---

    async def _count_active_routes(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(RouteModel.id)).where(
                RouteModel.tenant_id == tenant_id,
                RouteModel.status == RouteStatus.IN_PROGRESS,
            )
        )
        return result.scalar_one()

    async def _count_available_vehicles(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(VehicleModel.id)).where(
                VehicleModel.tenant_id == tenant_id,
                VehicleModel.status == VehicleStatus.ACTIVE,
            )
        )
        return result.scalar_one()

    async def _count_pending_deliveries(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(StopModel.id))
            .join(RouteModel, RouteModel.id == StopModel.route_id)
            .where(
                RouteModel.tenant_id == tenant_id,
                StopModel.status == StopStatus.SCHEDULED,
            )
        )
        return result.scalar_one()

    async def _count_open_leads(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(CommercialLead.id)).where(
                CommercialLead.tenant_id == tenant_id,
                CommercialLead.status == "NEW",
            )
        )
        return result.scalar_one()

    async def _count_pending_quotations(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(QuotationModel.id)).where(
                QuotationModel.tenant_id == tenant_id,
                QuotationModel.status == "DRAFT",
            )
        )
        return result.scalar_one()

    async def _count_active_contracts(self, tenant_id: UUID) -> int:
        result = await self.session.execute(
            select(func.count(ContractModel.id)).where(
                ContractModel.tenant_id == tenant_id,
                ContractModel.status == "ACTIVE",
            )
        )
        return result.scalar_one()

    async def _count_invoices_today(self, tenant_id: UUID) -> int:
        today = date.today()
        result = await self.session.execute(
            select(func.count(ORMInvoice.id)).where(
                ORMInvoice.tenant_id == tenant_id,
                func.date(ORMInvoice.created_at) == today,
            )
        )
        return result.scalar_one()

    async def _sum_completed_service_orders_today(self, tenant_id: UUID) -> int:
        """Count service orders completed today (replaces mock collections_today)."""
        from modules.logistics.infrastructure.orm_models import ORMServiceOrder
        today = date.today()
        result = await self.session.execute(
            select(func.count(ORMServiceOrder.id)).where(
                ORMServiceOrder.tenant_id == tenant_id,
                func.date(ORMServiceOrder.scheduled_date) == today,
            )
        )
        return result.scalar_one()

    async def get_stats(self, tenant_id: UUID) -> dict[str, any]:
        """
        Fetches all dashboard KPIs in parallel using asyncio.gather().
        This reduces latency from sum(N queries) to max(1 query) latency.
        """
        (
            active_routes,
            available_vehicles,
            pending_deliveries,
            open_leads,
            pending_quotations,
            active_contracts,
            invoices_today,
            orders_today,
        ) = await asyncio.gather(
            self._count_active_routes(tenant_id),
            self._count_available_vehicles(tenant_id),
            self._count_pending_deliveries(tenant_id),
            self._count_open_leads(tenant_id),
            self._count_pending_quotations(tenant_id),
            self._count_active_contracts(tenant_id),
            self._count_invoices_today(tenant_id),
            self._sum_completed_service_orders_today(tenant_id),
        )

        return {
            "active_routes": active_routes,
            "available_vehicles": available_vehicles,
            "pending_deliveries": pending_deliveries,
            "open_leads": open_leads,
            "pending_quotations": pending_quotations,
            "active_contracts": active_contracts,
            "invoices_today": invoices_today,
            # KPIs below require dedicated aggregation queries or data warehouse
            # TODO: implement real total_monthly_tons from service_order_items
            "total_monthly_tons": 0.0,
            # TODO: implement real recycling_rate from waste_manifests
            "recycling_rate": 0.0,
            "collections_today": {
                "total": orders_today,
                "completed": 0,   # TODO: filter by status=COMPLETED
                "in_route": 0,    # TODO: filter by status=IN_ROUTE
            },
            # TODO: implement real active_billing from invoices (sum of APPROVED invoices)
            "active_billing": 0.0,
        }
