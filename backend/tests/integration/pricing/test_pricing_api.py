from uuid import uuid4

import pytest

pytestmark = pytest.mark.asyncio

async def test_create_price_table(async_client):
    client = async_client
    tenant_id = uuid4()
    headers = {"x-tenant-id": str(tenant_id)}
    
    # 1. Create table
    response = await client.post(
        "/api/v1/pricing/tables",
        json={
            "name": "API Test Table",
            "effective_date": "2026-01-01",
            "is_active": True
        },
        headers=headers
    )
    assert response.status_code == 201
    table_id = response.json()["id"]
    
    # 2. Add item to table
    service_id = str(uuid4())
    uom_id = str(uuid4())
    
    resp_item = await client.post(
        f"/api/v1/pricing/tables/{table_id}/items",
        json={
            "service_offering_id": service_id,
            "unit_of_measure_id": uom_id,
            "amount": 250.00,
            "currency": "BRL"
        },
        headers=headers
    )
    assert resp_item.status_code == 201
    
    # 3. Create Rule
    resp_rule = await client.post(
        "/api/v1/pricing/rules",
        json={
            "name": "API Global Discount",
            "scope": "GLOBAL",
            "rule_type": "PERCENTAGE_DISCOUNT",
            "value": 10.00,
            "priority": 1
        },
        headers=headers
    )
    assert resp_rule.status_code == 201

    # 4. Calculate Price
    resp_calc = await client.post(
        "/api/v1/pricing/calculate",
        json={
            "service_offering_id": service_id,
            "unit_of_measure_id": uom_id,
            "quantity": 2, # 2 * 250 = 500, less 10% = 450
            "reference_date": "2026-06-01"
        },
        headers=headers
    )
    assert resp_calc.status_code == 200
    data = resp_calc.json()
    assert float(data["base_unit_price"]["amount"]) == 250.00
    assert float(data["total_base_price"]["amount"]) == 500.00
    assert float(data["final_price"]["amount"]) == 450.00
