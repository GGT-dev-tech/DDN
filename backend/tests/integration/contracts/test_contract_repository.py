import pytest
import uuid
import datetime
from decimal import Decimal

from database.session import get_db_session
from modules.contracts.domain.entities.contract import Contract
from modules.contracts.domain.value_objects import ContractTerm, ContractStatus, ContractItemSnapshot, Money
from modules.contracts.infrastructure.repositories.contract_repository import ContractRepository


# This test requires an async DB setup. Using pytest-asyncio and rolling back transactions
# Typical for repository integration tests in this project



@pytest.mark.asyncio
async def test_save_and_get_contract(db_session):
    repo = ContractRepository(db_session)
    
    tenant_id = uuid.uuid4()
    company_id = uuid.uuid4()
    
    # We must configure current tenant for RLS to pass in testing, or assume tests run as superuser 
    # depending on conftest. We'll set the current_tenant if needed.
    from sqlalchemy import text
    from sqlalchemy.exc import OperationalError
    try:
        await db_session.execute(text(f"SET app.current_tenant = '{tenant_id}';"))
    except OperationalError:
        # SQLite doesn't support PostgreSQL SET commands, ignore for local tests
        pass
    
    terms = ContractTerm(
        effective_date=datetime.date(2026, 1, 1),
        expiration_date=datetime.date(2027, 1, 1)
    )
    
    contract = Contract.create_draft(
        company_id=company_id,
        tenant_id=tenant_id,
        terms=terms
    )
    
    # Add an item to the version
    snapshot = ContractItemSnapshot(
        service_name="Dumpster Rental",
        unit_name="UN",
        base_unit_price=Money(Decimal("100"), "BRL"),
        total_base_price=Money(Decimal("100"), "BRL"),
        surcharges_total=Money(Decimal("0"), "BRL"),
        discounts_total=Money(Decimal("0"), "BRL"),
        final_price=Money(Decimal("100"), "BRL")
    )
    contract.current_version.add_item(
        service_offering_id=uuid.uuid4(),
        unit_of_measure_id=uuid.uuid4(),
        quantity=Decimal("1"),
        snapshot=snapshot
    )
    
    # Save
    await repo.save_contract(contract)
    await db_session.commit()
    
    # Get
    saved_contract = await repo.get_contract_by_id(contract.id)
    
    assert saved_contract is not None
    assert saved_contract.id == contract.id
    assert saved_contract.tenant_id == tenant_id
    assert saved_contract.company_id == company_id
    assert saved_contract.status == ContractStatus.DRAFT
    assert len(saved_contract.versions) == 1
    assert saved_contract.versions[0].version_number == 1
    
    items = saved_contract.versions[0].items
    assert len(items) == 1
    assert items[0].quantity == Decimal("1")
    assert items[0].snapshot.service_name == "Dumpster Rental"
    assert items[0].snapshot.final_price.amount == Decimal("100")

@pytest.mark.asyncio
async def test_rls_isolation(db_session):
    repo = ContractRepository(db_session)
    
    tenant_a = uuid.uuid4()
    tenant_b = uuid.uuid4()
    company_id = uuid.uuid4()
    
    # 1. Set context to Tenant A
    from sqlalchemy import text
    from sqlalchemy.exc import OperationalError
    try:
        await db_session.execute(text(f"SET app.current_tenant = '{tenant_a}';"))
    except OperationalError:
        pytest.skip("Skipping RLS test on SQLite")
        
    terms = ContractTerm(
        effective_date=datetime.date(2026, 1, 1),
        expiration_date=datetime.date(2027, 1, 1)
    )
    
    contract_a = Contract.create_draft(
        company_id=company_id,
        tenant_id=tenant_a,
        terms=terms
    )
    
    await repo.save_contract(contract_a)
    await db_session.commit()
    
    # 2. Switch to Tenant B
    await db_session.execute(text(f"SET app.current_tenant = '{tenant_b}';"))
    
    # 3. Tenant B tries to fetch Tenant A's contract
    result = await repo.get_contract_by_id(contract_a.id)
    
    # 4. Result must be None
    assert result is None
