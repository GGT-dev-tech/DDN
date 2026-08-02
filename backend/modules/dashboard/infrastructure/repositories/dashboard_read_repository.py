import abc
from datetime import date, timezone
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
    async def get_stats(self, tenant_id: UUID) -> dict[str, int]:
        pass


class DashboardReadRepository(IDashboardReadRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_stats(self, tenant_id: UUID) -> dict[str, int]:
        # --- Fleet & Routing ---

        active_routes_result = await self.session.execute(
            select(func.count(RouteModel.id)).where(
                RouteModel.tenant_id == tenant_id,
                RouteModel.status == RouteStatus.IN_PROGRESS
            )
        )
        active_routes = active_routes_result.scalar_one()

        available_vehicles_result = await self.session.execute(
            select(func.count(VehicleModel.id)).where(
                VehicleModel.tenant_id == tenant_id,
                VehicleModel.status == VehicleStatus.ACTIVE
            )
        )
        available_vehicles = available_vehicles_result.scalar_one()

        pending_deliveries_result = await self.session.execute(
            select(func.count(StopModel.id)).join(
                RouteModel, RouteModel.id == StopModel.route_id
            ).where(
                RouteModel.tenant_id == tenant_id,
                StopModel.status == StopStatus.SCHEDULED
            )
        )
        pending_deliveries = pending_deliveries_result.scalar_one()

        # --- Commercial ---

        open_leads_result = await self.session.execute(
            select(func.count(CommercialLead.id)).where(
                CommercialLead.tenant_id == tenant_id,
                CommercialLead.status == "NEW"
            )
        )
        open_leads = open_leads_result.scalar_one()

        pending_quotations_result = await self.session.execute(
            select(func.count(QuotationModel.id)).where(
                QuotationModel.tenant_id == tenant_id,
                QuotationModel.status == "DRAFT"
            )
        )
        pending_quotations = pending_quotations_result.scalar_one()

        active_contracts_result = await self.session.execute(
            select(func.count(ContractModel.id)).where(
                ContractModel.tenant_id == tenant_id,
                ContractModel.status == "ACTIVE"
            )
        )
        active_contracts = active_contracts_result.scalar_one()

        # --- Financial ---
        today = date.today()
        invoices_today_result = await self.session.execute(
            select(func.count(ORMInvoice.id)).where(
                ORMInvoice.tenant_id == tenant_id,
                func.date(ORMInvoice.created_at) == today
            )
        )
        invoices_today = invoices_today_result.scalar_one()

        return {
            "active_routes": active_routes,
            "available_vehicles": available_vehicles,
            "pending_deliveries": pending_deliveries,
            "open_leads": open_leads,
            "pending_quotations": pending_quotations,
            "active_contracts": active_contracts,
            "invoices_today": invoices_today,
        }
