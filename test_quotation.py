import asyncio
import uuid
from database.session import async_session_maker
from modules.quotations.application.services.quotation_service import QuotationService
from modules.core.infrastructure.uow import SQLAlchemyUnitOfWork
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository
from modules.pricing.application.services.pricing_service import PricingService
from modules.pricing.domain.services.price_calculation_engine import PriceCalculationEngine
from modules.pricing.infrastructure.repositories.pricing_repository import PricingRepository
from modules.quotations.infrastructure.adapters.pricing_gateway_impl import PricingGatewayImpl
from modules.quotations.infrastructure.adapters.catalog_gateway_impl import CatalogGatewayImpl

async def test():
    async with async_session_maker() as session:
        uow = SQLAlchemyUnitOfWork(session)
        repo = QuotationRepository(session)
        
        pricing_repo = PricingRepository(session)
        calculation_engine = PriceCalculationEngine()
        pricing_service = PricingService(uow=uow, repo=pricing_repo, calculation_engine=calculation_engine)
        pricing_gateway = PricingGatewayImpl(pricing_service)
        catalog_gateway = CatalogGatewayImpl(session)
        
        service = QuotationService(uow, repo, pricing_gateway, catalog_gateway)
        try:
            tenant_id = uuid.UUID('00000000-0000-0000-0000-000000000000') # default mock
            company_id = uuid.uuid4()
            quotation_id = await service.create_quotation(
                tenant_id=tenant_id,
                company_id=company_id,
                validity_days=30
            )
            print(f"Success! Quotation ID: {quotation_id}")
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(test())
