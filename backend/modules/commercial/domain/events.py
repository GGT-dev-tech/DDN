from dataclasses import dataclass
from uuid import UUID

from modules.core.domain.aggregate import DomainEvent


@dataclass(frozen=True)
class LeadRegistered(DomainEvent):
    lead_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class LeadQualified(DomainEvent):
    lead_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class LeadDisqualified(DomainEvent):
    lead_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class CompanyCreated(DomainEvent):
    company_id: UUID
    tenant_id: UUID

@dataclass(frozen=True)
class OpportunityOpened(DomainEvent):
    opportunity_id: UUID
    company_id: UUID
    tenant_id: UUID
