from pydantic import BaseModel


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
