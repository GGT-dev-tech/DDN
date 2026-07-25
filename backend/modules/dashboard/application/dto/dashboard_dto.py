from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    active_routes: int
    available_vehicles: int
    pending_deliveries: int
