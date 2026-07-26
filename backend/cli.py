import argparse
import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from modules.core.config.settings import settings
from modules.identity.domain.permissions import PermissionRegistry


async def sync_permissions():
    """
    Synchronizes the PermissionRegistry with the database's permissions table.
    """
    print("Starting permission sync...")
    engine = create_async_engine(
        settings.db.url.replace("postgresql://", "postgresql+asyncpg://"),
        echo=False,
    )
    
    permissions = PermissionRegistry.get_all()
    
    async with engine.begin() as conn:
        for perm in permissions:
            # Check if exists
            stmt = text("SELECT id FROM permissions WHERE code = :code")
            result = await conn.execute(stmt, {"code": perm.code.value})
            row = result.fetchone()
            
            if row:
                # Update
                update_stmt = text("""
                    UPDATE permissions 
                    SET name = :name, description = :description, module = :module
                    WHERE code = :code
                """)
                await conn.execute(update_stmt, {
                    "name": perm.name,
                    "description": perm.description,
                    "module": perm.module,
                    "code": perm.code.value
                })
                print(f"Updated permission: {perm.code.value}")
            else:
                # Insert
                insert_stmt = text("""
                    INSERT INTO permissions (code, name, description, module)
                    VALUES (:code, :name, :description, :module)
                """)
                await conn.execute(insert_stmt, {
                    "code": perm.code.value,
                    "name": perm.name,
                    "description": perm.description,
                    "module": perm.module
                })
                print(f"Inserted permission: {perm.code.value}")
                
    await engine.dispose()
    print("Permission sync completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stitch CLI Commands")
    parser.add_argument("command", choices=["sync_permissions"], help="Command to run")
    
    args = parser.parse_args()
    
    if args.command == "sync_permissions":
        asyncio.run(sync_permissions())
    else:
        print(f"Unknown command: {args.command}")
        sys.exit(1)
