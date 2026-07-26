from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TenantResponse(BaseModel):
    id: UUID
    name: str
    legal_name: str | None = None
    status: str
    plan: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TenantContextResponse(BaseModel):
    tenant: TenantResponse
    role: str
