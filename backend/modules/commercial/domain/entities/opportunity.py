from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from uuid import UUID

from modules.commercial.domain.events import OpportunityOpened
from modules.commercial.domain.exceptions import OpportunityException
from modules.core.domain.aggregate import AggregateRoot
from modules.core.domain.id_generator import IdGenerator


class OpportunityStage(Enum):
    DISCOVERY = "DISCOVERY"
    PROPOSAL = "PROPOSAL"
    NEGOTIATION = "NEGOTIATION"
    CLOSED_WON = "CLOSED_WON"
    CLOSED_LOST = "CLOSED_LOST"

@dataclass
class Opportunity(AggregateRoot):
    id: UUID
    tenant_id: UUID
    company_id: UUID
    title: str
    estimated_value: float | None
    stage: OpportunityStage
    source_id: str | None
    expected_close_date: date | None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def open(cls, tenant_id: UUID, company_id: UUID, title: str, estimated_value: float | None = None, source_id: str | None = None, expected_close_date: date | None = None) -> "Opportunity":
        opportunity = cls(
            id=IdGenerator.generate(),
            tenant_id=tenant_id,
            company_id=company_id,
            title=title,
            estimated_value=estimated_value,
            stage=OpportunityStage.DISCOVERY,
            source_id=source_id,
            expected_close_date=expected_close_date
        )
        opportunity.add_event(OpportunityOpened(opportunity_id=opportunity.id, company_id=opportunity.company_id, tenant_id=opportunity.tenant_id))
        return opportunity

    def win(self):
        if self.stage in [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST]:
            raise OpportunityException(f"Cannot win a {self.stage.value} opportunity.")
            
        self.stage = OpportunityStage.CLOSED_WON
        self.updated_at = datetime.utcnow()

    def lose(self):
        if self.stage in [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST]:
            raise OpportunityException(f"Cannot lose a {self.stage.value} opportunity.")
            
        self.stage = OpportunityStage.CLOSED_LOST
        self.updated_at = datetime.utcnow()

    def change_stage(self, stage: OpportunityStage):
        if self.stage in [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST]:
            raise OpportunityException(f"Cannot change stage of a {self.stage.value} opportunity.")
            
        self.stage = stage
        self.updated_at = datetime.utcnow()
