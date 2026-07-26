import pytest
import uuid
import datetime
from unittest.mock import AsyncMock

from modules.contracts.application.event_handlers.quotation_approved_listener import QuotationApprovedListener
from modules.quotations.domain.integration_events import QuotationApprovedIntegrationEvent
from modules.contracts.application.services.contract_service import ContractService

@pytest.mark.asyncio
async def test_quotation_approved_listener():
    # Mock dependencies
    mock_service = AsyncMock(spec=ContractService)
    listener = QuotationApprovedListener(contract_service=mock_service)
    
    # Event
    import json
    
    tenant_id = str(uuid.uuid4())
    company_id = str(uuid.uuid4())
    quotation_id = str(uuid.uuid4())
    
    payload = {
        "event_type": "QuotationApprovedIntegrationEvent",
        "payload": {
            "tenant_id": tenant_id,
            "company_id": company_id,
            "quotation_id": quotation_id,
            "items": [
                {
                    "service_offering_id": str(uuid.uuid4()),
                    "unit_of_measure_id": str(uuid.uuid4()),
                    "quantity": "10.00",
                    "snapshot": {
                        "service_name": "Test Service",
                        "unit_name": "Test Unit",
                        "base_unit_price": {"amount": "100.00", "currency": "BRL"},
                        "total_base_price": {"amount": "1000.00", "currency": "BRL"},
                        "surcharges_total": {"amount": "0.00", "currency": "BRL"},
                        "discounts_total": {"amount": "0.00", "currency": "BRL"},
                        "final_price": {"amount": "1000.00", "currency": "BRL"},
                    }
                }
            ]
        }
    }
    
    # Run handler
    await listener.handle(json.dumps(payload))
    
    # Verify that contract_service.create_contract was called properly
    assert mock_service.create_contract.called
