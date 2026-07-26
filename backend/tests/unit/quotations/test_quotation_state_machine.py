import pytest
import uuid
from decimal import Decimal
from datetime import datetime, UTC

from modules.quotations.domain.entities.quotation import Quotation, QuotationItem
from modules.quotations.domain.value_objects import QuotationStatus, QuotationItemSnapshot, Money


def test_quotation_starts_as_draft():
    tenant_id = uuid.uuid4()
    company_id = uuid.uuid4()
    expires_at = datetime.now(UTC)
    
    quotation = Quotation.create_draft(company_id, tenant_id, expires_at)
    
    assert quotation.status == QuotationStatus.DRAFT
    assert len(quotation.collect_events()) == 1


def test_quotation_cannot_add_items_if_not_draft():
    tenant_id = uuid.uuid4()
    company_id = uuid.uuid4()
    quotation = Quotation(company_id, tenant_id, status=QuotationStatus.SUBMITTED)
    
    with pytest.raises(ValueError):
        quotation.add_item(uuid.uuid4(), uuid.uuid4(), Decimal("10"))


def test_mark_as_priced_requires_snapshots():
    tenant_id = uuid.uuid4()
    company_id = uuid.uuid4()
    quotation = Quotation.create_draft(company_id, tenant_id, datetime.now(UTC))
    
    item = quotation.add_item(uuid.uuid4(), uuid.uuid4(), Decimal("10"))
    
    # Attempting to mark as priced without snapshot should fail
    with pytest.raises(ValueError):
        quotation.mark_as_priced()
        
    # Attach snapshot
    snapshot = QuotationItemSnapshot(
        service_name="Test",
        unit_name="UN",
        base_unit_price=Money(Decimal("100")),
        total_base_price=Money(Decimal("1000")),
        surcharges_total=Money(Decimal("0")),
        discounts_total=Money(Decimal("0")),
        final_price=Money(Decimal("1000")),
        pricing_reference="None"
    )
    item.attach_snapshot(snapshot)
    
    quotation.mark_as_priced()
    assert quotation.status == QuotationStatus.PRICED


def test_submit_requires_priced_or_draft_with_snapshots():
    tenant_id = uuid.uuid4()
    company_id = uuid.uuid4()
    quotation = Quotation.create_draft(company_id, tenant_id, datetime.now(UTC))
    
    with pytest.raises(ValueError):
        quotation.submit()  # Empty quotation fails
        
    item = quotation.add_item(uuid.uuid4(), uuid.uuid4(), Decimal("10"))
    
    with pytest.raises(ValueError):
        quotation.submit()  # No snapshot fails
        
    snapshot = QuotationItemSnapshot(
        service_name="Test",
        unit_name="UN",
        base_unit_price=Money(Decimal("100")),
        total_base_price=Money(Decimal("1000")),
        surcharges_total=Money(Decimal("0")),
        discounts_total=Money(Decimal("0")),
        final_price=Money(Decimal("1000")),
        pricing_reference="None"
    )
    item.attach_snapshot(snapshot)
    
    quotation.submit()
    assert quotation.status == QuotationStatus.SUBMITTED
