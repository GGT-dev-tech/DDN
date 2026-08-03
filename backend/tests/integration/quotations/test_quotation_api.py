from decimal import Decimal
from uuid import uuid4

import pytest

from modules.quotations.domain.value_objects import Money, QuotationItemSnapshot
from modules.quotations.infrastructure.adapters.pricing_gateway_impl import PricingContext

pytestmark = pytest.mark.asyncio

class MockPricingGateway:
    async def get_price_snapshot(self, context: PricingContext) -> QuotationItemSnapshot:
        return QuotationItemSnapshot(
            service_name="Mocked Service",
            unit_name="Mocked Unit",
            base_unit_price=Money(Decimal("100.00"), "BRL"),
            total_base_price=Money(Decimal("1000.00"), "BRL"),
            surcharges_total=Money(Decimal("0.00"), "BRL"),
            discounts_total=Money(Decimal("0.00"), "BRL"),
            final_price=Money(Decimal("1000.00"), "BRL"),
            pricing_reference="Mocked Table"
        )

class MockCatalogGateway:
    async def get_service_offering_name(self, offering_id) -> str:
        return "Mocked Service"
    async def get_unit_of_measure_name(self, uom_id) -> str:
        return "Mocked Unit"

@pytest.fixture
def override_gateways(app):
    from modules.quotations.application.services.quotation_service import QuotationService
    from modules.quotations.infrastructure.repositories.quotation_repository import (
        QuotationRepository,
    )
    
    # We override the dependency to use the mocks
    async def custom_get_quotation_service(session=None):
        # We need an actual DB session to test DB persistence
        repo = QuotationRepository(session)
        pricing_gateway = MockPricingGateway()
        catalog_gateway = MockCatalogGateway()
        return QuotationService(session, repo, pricing_gateway, catalog_gateway)

    # Note: Fast API app dependency override isn't trivial to setup perfectly inline if it depends on async yields
    # For this test, we will monkeypatch the service method directly to return a snapshot


async def test_quotation_api_golden_path(async_client, monkeypatch):
    client = async_client
    tenant_id = uuid4()
    company_id = uuid4()
    headers = {"x-tenant-id": str(tenant_id)}
    
    # Monkeypatch the Adapters used by QuotationService
    async def mock_get_price_snapshot(self, context):
        return QuotationItemSnapshot(
            service_name="Mocked Service",
            unit_name="Mocked Unit",
            base_unit_price=Money(Decimal("100.00"), "BRL"),
            total_base_price=Money(Decimal("1000.00"), "BRL"),
            surcharges_total=Money(Decimal("0.00"), "BRL"),
            discounts_total=Money(Decimal("0.00"), "BRL"),
            final_price=Money(Decimal("1000.00"), "BRL"),
            pricing_reference="Mocked Table"
        )
    
    async def mock_get_service_offering_name(self, id): return "Mocked Service"
    async def mock_get_unit_of_measure_name(self, id): return "Mocked Unit"
    
    from modules.quotations.infrastructure.adapters.catalog_gateway_impl import CatalogGatewayImpl
    from modules.quotations.infrastructure.adapters.pricing_gateway_impl import PricingGatewayImpl
    
    monkeypatch.setattr(PricingGatewayImpl, "get_price_snapshot", mock_get_price_snapshot)
    monkeypatch.setattr(CatalogGatewayImpl, "get_service_offering_name", mock_get_service_offering_name)
    monkeypatch.setattr(CatalogGatewayImpl, "get_unit_of_measure_name", mock_get_unit_of_measure_name)
    
    # 1. Create Quotation (DRAFT)
    resp_create = await client.post(
        "/api/v1/quotations",
        json={
            "company_id": str(company_id),
            "validity_days": 30
        },
        headers=headers
    )
    assert resp_create.status_code == 200
    quotation_id = resp_create.json()["quotation_id"]
    
    # 2. Add Item
    service_id = str(uuid4())
    uom_id = str(uuid4())
    resp_item = await client.post(
        f"/api/v1/quotations/{quotation_id}/items",
        json={
            "service_offering_id": service_id,
            "unit_of_measure_id": uom_id,
            "quantity": 10.0
        },
        headers=headers
    )
    assert resp_item.status_code == 200
    
    # 3. Calculate (DRAFT -> PRICED)
    resp_calc = await client.post(
        f"/api/v1/quotations/{quotation_id}/calculate",
        json={"reference_date": "2026-06-01"},
        headers=headers
    )
    assert resp_calc.status_code == 200
    assert "successfully" in resp_calc.json()["message"]
    
    # 4. Submit (PRICED -> SUBMITTED)
    resp_submit = await client.post(
        f"/api/v1/quotations/{quotation_id}/submit",
        headers=headers
    )
    assert resp_submit.status_code == 200
    assert "successfully" in resp_submit.json()["message"]
    
    # 5. Approve (SUBMITTED -> APPROVED)
    resp_approve = await client.post(
        f"/api/v1/quotations/{quotation_id}/approve",
        headers=headers
    )
    assert resp_approve.status_code == 200
    assert "successfully" in resp_approve.json()["message"]


async def test_quotation_api_invalid_transition(async_client):
    client = async_client
    tenant_id = uuid4()
    company_id = uuid4()
    headers = {"x-tenant-id": str(tenant_id)}
    
    resp_create = await client.post(
        "/api/v1/quotations",
        json={"company_id": str(company_id), "validity_days": 30},
        headers=headers
    )
    quotation_id = resp_create.json()["quotation_id"]
    
    # Try to approve a DRAFT quotation directly
    resp_approve = await client.post(
        f"/api/v1/quotations/{quotation_id}/approve",
        headers=headers
    )
    
    assert resp_approve.status_code == 400
    assert "Quotation must be SUBMITTED to be approved" in resp_approve.json()["detail"]
