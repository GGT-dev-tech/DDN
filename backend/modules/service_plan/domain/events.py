"""Service Plan Domain — Domain Events (internal to this BC)."""
from __future__ import annotations

import uuid
from dataclasses import dataclass

from modules.core.domain.events import DomainEvent


@dataclass(frozen=True)
class ServicePlanCreated(DomainEvent):
    plan_id: uuid.UUID
    tenant_id: uuid.UUID
    contract_id: uuid.UUID
    company_id: uuid.UUID


@dataclass(frozen=True)
class ServicePlanPublished(DomainEvent):
    plan_id: uuid.UUID
    tenant_id: uuid.UUID
    contract_id: uuid.UUID
    company_id: uuid.UUID


@dataclass(frozen=True)
class ServicePlanSuspended(DomainEvent):
    plan_id: uuid.UUID
    tenant_id: uuid.UUID
