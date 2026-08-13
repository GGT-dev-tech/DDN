from pydantic import BaseModel
from typing import Dict

class CollectionsToday(BaseModel):
    total: int
    completed: int
    in_route: int

class DashboardStatsResponse(BaseModel):
    # Fleet & Routing
    active_routes: int
    available_vehicles: int
    pending_deliveries: int
    # Commercial
    open_leads: int = 0
    pending_quotations: int = 0
    active_contracts: int = 0
    # Financial
    invoices_today: int = 0
    # Advanced KPIs
    total_monthly_tons: float = 0.0
    recycling_rate: float = 0.0
    collections_today: CollectionsToday
    active_billing: float = 0.0
