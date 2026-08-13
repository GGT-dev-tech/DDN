import asyncio
from uuid import UUID
from database.session import async_session_maker
from sqlalchemy import text

async def check():
    async with async_session_maker() as session:
        result = await session.execute(text("SELECT id, corporate_name, tenant_id FROM commercial_companies"))
        companies = result.fetchall()
        print("Companies:", companies)
        
        result2 = await session.execute(text("SELECT id, name FROM core_tenants"))
        tenants = result2.fetchall()
        print("Tenants:", tenants)

if __name__ == "__main__":
    asyncio.run(check())
