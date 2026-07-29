from modules.core.domain.id_generator import IdGenerator
import uuid
from datetime import UTC, datetime

from modules.contracts.domain.entities.version import ContractVersion
from modules.contracts.domain.events import ContractCreated, ContractStatusChanged
from modules.contracts.domain.value_objects import ContractStatus, ContractTerm
from shared_kernel.contracts.aggregate_root import AggregateRoot


class Contract(AggregateRoot):
    @property
    def id(self) -> uuid.UUID:
        return self._id
        
    @property
    def version(self) -> int:
        return self.current_version.version_number if self.versions else 1

    def __init__(
        self,
        company_id: uuid.UUID,
        tenant_id: uuid.UUID,
        terms: ContractTerm,
        quotation_id: uuid.UUID | None = None,
        status: ContractStatus = ContractStatus.DRAFT,
        id: uuid.UUID | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self.company_id = company_id
        self.tenant_id = tenant_id
        self.quotation_id = quotation_id  # Reference to origin if any
        self.terms = terms
        self.status = status
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)
        
        self.versions: list[ContractVersion] = []
        
    @classmethod
    def create_draft(
        cls, 
        company_id: uuid.UUID, 
        tenant_id: uuid.UUID, 
        terms: ContractTerm,
        quotation_id: uuid.UUID | None = None
    ) -> 'Contract':
        contract = cls(
            company_id=company_id,
            tenant_id=tenant_id,
            terms=terms,
            quotation_id=quotation_id,
            status=ContractStatus.DRAFT
        )
        
        # Initialize with Version 1
        version = ContractVersion(version_number=1)
        contract.versions.append(version)
        
        contract.add_event(ContractCreated(contract_id=contract.id, tenant_id=tenant_id))
        
        return contract

    @property
    def current_version(self) -> ContractVersion:
        if not self.versions:
            raise ValueError("Contract has no versions")
        # Assuming versions are appended in order, last is current
        return max(self.versions, key=lambda v: v.version_number)

    def send_for_signature(self) -> None:
        if self.status != ContractStatus.DRAFT:
            raise ValueError(f"Cannot send for signature from status {self.status.value}")
        
        self.status = ContractStatus.WAITING_SIGNATURE
        self.updated_at = datetime.now(UTC)
        self.add_event(ContractStatusChanged(contract_id=self.id, tenant_id=self.tenant_id, new_status=self.status.value))

    def activate(self) -> None:
        if self.status not in [ContractStatus.DRAFT, ContractStatus.WAITING_SIGNATURE]:
            raise ValueError(f"Cannot activate contract from status {self.status.value}")
            
        self.status = ContractStatus.ACTIVE
        self.updated_at = datetime.now(UTC)
        self.add_event(ContractStatusChanged(contract_id=self.id, tenant_id=self.tenant_id, new_status=self.status.value))
