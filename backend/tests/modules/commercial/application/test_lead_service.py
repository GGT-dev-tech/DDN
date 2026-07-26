from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from modules.commercial.application.services.lead_service import LeadService
from modules.commercial.domain.entities.company import Company
from modules.commercial.domain.entities.lead import Lead, LeadStatus


@pytest.mark.asyncio
async def test_match_to_company_creates_new_company_and_opportunity():
    tenant_id = uuid4()
    
    lead_repo = AsyncMock()
    company_service = AsyncMock()
    opportunity_service = AsyncMock()
    
    service = LeadService(lead_repo, company_service, opportunity_service)
    
    # Mock Lead
    lead = Lead.register(tenant_id, "Test Lead", "Test Contact")
    lead_repo.get_by_id.return_value = lead
    
    # Mock newly created Company
    new_company = Company.create(tenant_id, "Test Trade", "Test Corp", "123")
    company_service.create_company.return_value = new_company
    
    # Mock created Opportunity
    mock_opp = MagicMock()
    opportunity_service.open_opportunity.return_value = mock_opp
    
    result = await service.match_to_company(
        tenant_id=tenant_id,
        lead_id=lead.id,
        company_id=None,
        trade_name="Test Trade",
        corporate_name="Test Corp",
        document_number="123"
    )
    
    assert result["company_id"] == new_company.id
    assert lead.status == LeadStatus.CONVERTED
    
    # Verify Company creation was called
    company_service.create_company.assert_called_once_with(
        tenant_id=tenant_id,
        trade_name="Test Trade",
        corporate_name="Test Corp",
        document_number="123"
    )
    
    # Verify Opportunity opening was called
    opportunity_service.open_opportunity.assert_called_once_with(
        tenant_id=tenant_id,
        company_id=new_company.id,
        title=f"Opportunity from Lead: {lead.company_name}",
        source_id=lead.source_id
    )
