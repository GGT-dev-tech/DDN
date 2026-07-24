from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Set, Optional
from uuid import UUID

class AuthenticationMethod(str, Enum):
    JWT = "JWT"
    API_KEY = "API_KEY"
    SERVICE_ACCOUNT = "SERVICE_ACCOUNT"
    INTERNAL = "INTERNAL"

@dataclass(frozen=True)
class RequestContext:
    request_id: UUID
    trace_id: str
    ip: str
    user_agent: str
    path: str
    method: str
    started_at: datetime

@dataclass(frozen=True)
class AuthContext:
    user_id: UUID
    session_id: Optional[UUID]
    authentication_method: AuthenticationMethod
    authenticated_at: datetime

@dataclass(frozen=True)
class TenantContext:
    tenant_id: UUID
    membership_id: Optional[UUID] = None
    role_ids: Set[UUID] = field(default_factory=set)
