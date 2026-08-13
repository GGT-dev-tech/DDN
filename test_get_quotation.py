import asyncio
import uuid
from database.session import async_session_maker
from modules.quotations.infrastructure.repositories.quotation_repository import QuotationRepository
from modules.quotations.application.use_cases.get_quotation import GetQuotation

async def test():
    async with async_session_maker() as session:
        repo = QuotationRepository(session)
        use_case = GetQuotation(repo)
        
        tenant_id = uuid.UUID('00000000-0000-0000-0000-000000000000') # default mock
        quotation_id = uuid.uuid4()
        try:
            quotation = await use_case.execute(tenant_id, quotation_id)
            print(f"Success! Quotation: {quotation}")
        except Exception as e:
            import traceback
            traceback.print_exc()

asyncio.run(test())
