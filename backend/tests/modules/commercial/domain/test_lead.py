from uuid import uuid4

import pytest

from modules.commercial.domain.entities.lead import Lead, LeadStatus
from modules.commercial.domain.exceptions import LeadQualificationException


def test_lead_registration():
    tenant_id = uuid4()
    lead = Lead.register(
        tenant_id=tenant_id,
        company_name="Acme Corp",
        contact_name="John Doe"
    )
    
    assert lead.status == LeadStatus.NEW
    assert lead.company_name == "Acme Corp"
    assert lead.contact_name == "John Doe"
    assert len(lead.collect_events()) == 1
    assert lead.collect_events()[0].__class__.__name__ == "LeadRegistered"

def test_lead_qualification_fails_without_contact_info():
    tenant_id = uuid4()
    lead = Lead.register(
        tenant_id=tenant_id,
        company_name="Acme Corp",
        contact_name="John Doe"
    )
    
    # Missing email and phone
    with pytest.raises(LeadQualificationException):
        lead.qualify()

def test_lead_qualification_succeeds_with_email():
    tenant_id = uuid4()
    lead = Lead.register(
        tenant_id=tenant_id,
        company_name="Acme Corp",
        contact_name="John Doe",
        email="john@acme.com"
    )
    
    lead.qualify()
    assert lead.status == LeadStatus.QUALIFIED
    assert len(lead.collect_events()) == 2
    assert lead.collect_events()[-1].__class__.__name__ == "LeadQualified"
