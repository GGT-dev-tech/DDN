from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID

from modules.commercial.domain.events import LeadDisqualified, LeadQualified, LeadRegistered
from modules.commercial.domain.exceptions import (
    LeadQualificationException,
    LeadStatusTransitionException,
)
from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator


class LeadStatus(Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    LOST = "LOST"
    CONVERTED = "CONVERTED"

@dataclass
class Lead(AggregateRoot):
    id: UUID
    tenant_id: UUID
    company_name: str
    contact_name: str
    status: LeadStatus
    email: str | None = None
    phone: str | None = None
    source_id: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def register(cls, tenant_id: UUID, company_name: str, contact_name: str, email: str | None = None, phone: str | None = None, source_id: str | None = None, address: str | None = None, latitude: float | None = None, longitude: float | None = None) -> "Lead":
        lead = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            company_name=company_name,
            contact_name=contact_name,
            status=LeadStatus.NEW,
            email=email,
            phone=phone,
            source_id=source_id,
            address=address,
            latitude=latitude,
            longitude=longitude
        )
        lead.add_event(LeadRegistered(lead_id=lead.id, tenant_id=lead.tenant_id))
        return lead

    def qualify(self):
        if self.status in [LeadStatus.LOST, LeadStatus.CONVERTED]:
            raise LeadStatusTransitionException(f"Cannot qualify a {self.status.value} lead.")
        
        # Invariant: A lead can only be qualified if it has an email or a phone
        if not self.email and not self.phone:
            raise LeadQualificationException("Cannot qualify lead without an email or phone number.")
            
        self.status = LeadStatus.QUALIFIED
        self.updated_at = datetime.utcnow()
        self.add_event(LeadQualified(lead_id=self.id, tenant_id=self.tenant_id))

    def disqualify(self):
        if self.status == LeadStatus.CONVERTED:
            raise LeadStatusTransitionException("Cannot disqualify a CONVERTED lead.")
            
        self.status = LeadStatus.LOST
        self.updated_at = datetime.utcnow()
        self.add_event(LeadDisqualified(lead_id=self.id, tenant_id=self.tenant_id))

    def convert(self):
        if self.status == LeadStatus.LOST:
            raise LeadStatusTransitionException("Cannot convert a LOST lead.")
            
        self.status = LeadStatus.CONVERTED
        self.updated_at = datetime.utcnow()
        # LeadConverted could be added here if needed, but the main driver is MatchToCompany -> OpportunityOpened
