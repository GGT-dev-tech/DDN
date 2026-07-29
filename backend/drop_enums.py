import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from database.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.execute(text("DROP TYPE IF EXISTS serviceplanstatus CASCADE"))
        await conn.execute(text("DROP TYPE IF EXISTS schedulestatus CASCADE"))
        print("Dropped enums.")

asyncio.run(main())
