import uuid
from datetime import date

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from modules.catalog.domain.entities.service_attribute import AttributeType, ServiceAttribute
from modules.catalog.domain.entities.service_offering import ServiceOffering
from modules.catalog.domain.entities.unit_of_measure import UnitOfMeasure, UOMBaseType
from modules.catalog.infrastructure.repositories.catalog_repository import CatalogRepository


@pytest.fixture
async def catalog_repo(db_session: AsyncSession):
    return CatalogRepository(db_session)

@pytest.mark.asyncio
async def test_add_and_get_uom(catalog_repo: CatalogRepository):
    test_tenant_id = uuid.uuid4()
    uom = UnitOfMeasure.create(
        tenant_id=test_tenant_id,
        symbol="m3_test",
        name="Cubic Meter",
        base_type=UOMBaseType.VOLUME
    )
    await catalog_repo.add_uom(uom)
    await catalog_repo._session.commit()
    
    fetched = await catalog_repo.get_uom_by_id(uom.id)
    assert fetched is not None
    assert fetched.symbol == "m3_test"
    assert fetched.base_type == UOMBaseType.VOLUME

@pytest.mark.asyncio
async def test_add_and_get_service_attribute(catalog_repo: CatalogRepository):
    test_tenant_id = uuid.uuid4()
    attr = ServiceAttribute.create(
        tenant_id=test_tenant_id,
        name="Waste Type Test",
        attribute_type=AttributeType.WASTE_TYPE,
        possible_values=["Class I", "Class II", "Class II B"],
        is_required=True
    )
    await catalog_repo.add_service_attribute(attr)
    await catalog_repo._session.commit()
    
    fetched = await catalog_repo.get_service_attribute_by_id(attr.id)
    assert fetched is not None
    assert "Class II" in fetched.possible_values
    assert fetched.is_required is True

@pytest.mark.asyncio
async def test_add_and_update_service_offering(catalog_repo: CatalogRepository):
    test_tenant_id = uuid.uuid4()
    # Setup UOM
    uom = UnitOfMeasure.create(tenant_id=test_tenant_id, symbol="tn_test", name="Tons", base_type=UOMBaseType.WEIGHT)
    await catalog_repo.add_uom(uom)
    
    # Setup Attribute
    attr = ServiceAttribute.create(
        tenant_id=test_tenant_id, name="Type", attribute_type=AttributeType.WASTE_TYPE, possible_values=["A", "B", "C"]
    )
    await catalog_repo.add_service_attribute(attr)
    await catalog_repo._session.commit()

    # Create Offering
    offering = ServiceOffering.draft(
        tenant_id=test_tenant_id,
        name="Disposal Service",
        description="Waste disposal",
        category="Disposal",
        default_uom_id=uom.id,
        effective_date=date.today()
    )
    offering.add_attribute(attr.id, ["A", "B"])
    
    await catalog_repo.add_service_offering(offering)
    await catalog_repo._session.commit()
    
    # Verify Read
    fetched = await catalog_repo.get_service_offering_by_id(offering.id)
    assert fetched is not None
    assert fetched.name == "Disposal Service"
    assert len(fetched.attributes) == 1
    assert "B" in fetched.attributes[0].allowed_values

    # Verify Update (Activate)
    fetched.activate()
    await catalog_repo.update_service_offering(fetched)
    await catalog_repo._session.commit()
    
    updated = await catalog_repo.get_service_offering_by_id(offering.id)
    assert updated.status == "ACTIVE"
