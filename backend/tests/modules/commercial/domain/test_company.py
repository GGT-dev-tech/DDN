from uuid import uuid4

import pytest

from modules.commercial.domain.entities.company import Company, CompanyStatus
from modules.commercial.domain.exceptions import CompanyDocumentException


def test_company_creation():
    tenant_id = uuid4()
    company = Company.create(
        tenant_id=tenant_id,
        trade_name="Tech Corp",
        corporate_name="Tech Corporation SA",
        document_number="12.345.678/0001-90"
    )
    
    assert company.status == CompanyStatus.PROSPECT
    assert company.document_number == "12.345.678/0001-90"
    assert len(company.collect_events()) == 1
    assert company.collect_events()[0].__class__.__name__ == "CompanyCreated"

def test_company_creation_fails_without_document():
    tenant_id = uuid4()
    
    with pytest.raises(CompanyDocumentException):
        Company.create(
            tenant_id=tenant_id,
            trade_name="Tech Corp",
            corporate_name="Tech Corporation SA",
            document_number=""
        )
