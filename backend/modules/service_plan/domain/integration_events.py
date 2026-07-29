"""
Service Plan — Integration Events (public contract with other BCs).

Naming: oriented to the domain fact, not the expected consumer action (D2).
The Routing BC decides that ServicePlanPublished means "generate route schedules".

These classes are separate from the Domain Events even though they share names.
The module prefix (service_plan.domain.integration_events) disambiguates.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any

from shared_kernel.events.integration import EventMetadata, IntegrationEvent


@dataclass(frozen=True)
class ServicePlanPublished(IntegrationEvent):
    """
    Published when a ServicePlan transitions from DRAFT to ACTIVE.

    Consumed by: Routing / Operations BC.
    The consumer never queries the Service Plan database directly (D8).
    All schedule data needed to generate routes is included in this payload.
    """
    metadata: EventMetadata
    plan_id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID
    contract_id: uuid.UUID
    effective_date: str                 # ISO date string
    expiration_date: str | None
    schedules: list[dict[str, Any]]     # serialized ServiceSchedule list


@dataclass(frozen=True)
class ServicePlanSuspended(IntegrationEvent):
    """
    Published when a ServicePlan transitions to SUSPENDED.
    Routing should pause route generation for the affected plan.
    """
    metadata: EventMetadata
    plan_id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID
    contract_id: uuid.UUID
