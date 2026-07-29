import uuid
from datetime import date

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_uom_api(async_client: AsyncClient):
    tenant_id = str(uuid.uuid4())
    response = await async_client.post(
        "/api/v1/catalog/uom",
        json={
            "symbol": "ton_api",
            "name": "Ton",
            "base_type": "WEIGHT"
        },
        headers={"x-tenant-id": tenant_id}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data

@pytest.mark.asyncio
async def test_define_attribute_api(async_client: AsyncClient):
    tenant_id = str(uuid.uuid4())
    response = await async_client.post(
        "/api/v1/catalog/attributes",
        json={
            "name": "Frequency_api",
            "attribute_type": "FREQUENCY",
            "possible_values": ["Daily", "Weekly", "Monthly"],
            "is_required": True
        },
        headers={"x-tenant-id": tenant_id}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data

@pytest.mark.asyncio
async def test_draft_and_activate_offering_api(async_client: AsyncClient):
    tenant_id = str(uuid.uuid4())
    headers = {"x-tenant-id": tenant_id}
    
    # Setup UOM
    uom_resp = await async_client.post(
        "/api/v1/catalog/uom", json={"symbol": "m3_api", "name": "M3", "base_type": "VOLUME"}, headers=headers
    )
    uom_id = uom_resp.json()["id"]

    # Setup Attribute
    attr_resp = await async_client.post(
        "/api/v1/catalog/attributes", json={
            "name": "Type_api", "attribute_type": "WASTE_TYPE", "possible_values": ["A", "B", "C"]
        }, headers=headers
    )
    attr_id = attr_resp.json()["id"]

    # Draft Offering
    draft_resp = await async_client.post(
        "/api/v1/catalog/offerings",
        json={
            "name": "Collection API",
            "description": "Collect waste",
            "category": "Collection",
            "default_uom_id": uom_id,
            "effective_date": str(date.today())
        },
        headers=headers
    )
    assert draft_resp.status_code == 201
    offering_id = draft_resp.json()["id"]

    # Attach Attribute
    attach_resp = await async_client.post(
        f"/api/v1/catalog/offerings/{offering_id}/attributes",
        json={
            "attribute_id": attr_id,
            "allowed_values": ["A", "B"]
        },
        headers=headers
    )
    assert attach_resp.status_code == 200

    # Activate
    activate_resp = await async_client.post(f"/api/v1/catalog/offerings/{offering_id}/activate", headers=headers)
    assert activate_resp.status_code == 200
