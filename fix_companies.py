import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from modules.core.config.settings import settings

async def main():
    db_url = settings.db.url.replace("+asyncpg", "+psycopg") if "+asyncpg" in settings.db.url else settings.db.url
    db_url = db_url.replace("+psycopg", "+asyncpg")
    
    engine = create_async_engine(db_url)
    async with AsyncSession(engine) as session:
        # Fix companies
        await session.execute(text("UPDATE commercial_companies SET status = 'CUSTOMER' WHERE status = 'ACTIVE';"))
        
        # Also fix leads if there's any invalid status
        await session.execute(text("UPDATE commercial_leads SET status = 'NEW' WHERE status = 'ACTIVE';"))
        
        await session.commit()
    print("Database fixed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
