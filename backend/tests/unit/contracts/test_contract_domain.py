import uuid
from datetime import date
from decimal import Decimal

import pytest

from modules.contracts.domain.entities.contract import Contract
from modules.contracts.domain.events import ContractCreated, ContractStatusChanged
from modules.contracts.domain.value_objects import (
    ContractItemSnapshot,
    ContractStatus,
    ContractTerm,
    Money,
)


def test_contract_creation_draft():
    company_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    quotation_id = uuid.uuid4()
    terms = ContractTerm(effective_date=date(2026, 1, 1), expiration_date=None)
    
    contract = Contract.create_draft(
        company_id=company_id,
        tenant_id=tenant_id,
        terms=terms,
        quotation_id=quotation_id
    )
    
    assert contract.status == ContractStatus.DRAFT
    assert contract.company_id == company_id
    assert contract.tenant_id == tenant_id
    assert contract.quotation_id == quotation_id
    
    # Check versioning
    assert len(contract.versions) == 1
    assert contract.current_version.version_number == 1
    
    # Check Domain Events
    events = contract.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], ContractCreated)
    assert events[0].tenant_id == tenant_id

def test_contract_state_machine():
    terms = ContractTerm(effective_date=date(2026, 1, 1), expiration_date=None)
    contract = Contract.create_draft(
        company_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        terms=terms
    )
    
    # Clear creation event
    contract.clear_events()
    
    # DRAFT -> WAITING_SIGNATURE
    contract.send_for_signature()
    assert contract.status == ContractStatus.WAITING_SIGNATURE
    
    events = contract.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], ContractStatusChanged)
    assert events[0].new_status == "WAITING_SIGNATURE"
    
    contract.clear_events()
    
    # WAITING_SIGNATURE -> ACTIVE
    contract.activate()
    assert contract.status == ContractStatus.ACTIVE
    
    events = contract.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], ContractStatusChanged)
    assert events[0].new_status == "ACTIVE"

def test_contract_invalid_state_transition():
    terms = ContractTerm(effective_date=date(2026, 1, 1), expiration_date=None)
    contract = Contract.create_draft(
        company_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        terms=terms
    )
    
    contract.activate()
    assert contract.status == ContractStatus.ACTIVE
    
    with pytest.raises(ValueError):
        # Cannot send for signature from ACTIVE
        contract.send_for_signature()

def test_contract_add_item_to_version():
    terms = ContractTerm(effective_date=date(2026, 1, 1), expiration_date=None)
    contract = Contract.create_draft(
        company_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        terms=terms
    )
    
    snapshot = ContractItemSnapshot(
        service_name="Test Service",
        unit_name="UN",
        base_unit_price=Money(Decimal(100), "BRL"),
        total_base_price=Money(Decimal(100), "BRL"),
        surcharges_total=Money(Decimal(0), "BRL"),
        discounts_total=Money(Decimal(0), "BRL"),
        final_price=Money(Decimal(100), "BRL")
    )
    
    item = contract.current_version.add_item(
        service_offering_id=uuid.uuid4(),
        unit_of_measure_id=uuid.uuid4(),
        quantity=Decimal(1),
        snapshot=snapshot
    )
    
    assert len(contract.current_version.items) == 1
    assert contract.current_version.items[0].snapshot.service_name == "Test Service"
    assert contract.current_version.items[0].quantity == Decimal(1)
