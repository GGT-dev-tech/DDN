from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event, text
from modules.core.config.settings import settings
from modules.core.context import accessor

# Create async engine. Pool pre-ping ensures connections are alive.
engine = create_async_engine(
    settings.db.url.replace("postgresql://", "postgresql+asyncpg://"),
    pool_pre_ping=True,
    echo=False,
)

from modules.audit.services.audit_listener import setup_audit_listeners

@event.listens_for(engine.sync_engine, "begin")
def do_begin(conn):
    # This event runs synchronously but within the async engine's thread pool.
    tenant_ctx = accessor.tenant()
    if tenant_ctx and tenant_ctx.tenant_id:
        conn.execute(text(f"SET LOCAL app.current_tenant_id = '{tenant_ctx.tenant_id}'"))
    
    auth_ctx = accessor.auth()
    if auth_ctx and auth_ctx.user_id:
        conn.execute(text(f"SET LOCAL app.current_user_id = '{auth_ctx.user_id}'"))
        if auth_ctx.session_id:
            conn.execute(text(f"SET LOCAL app.current_session_id = '{auth_ctx.session_id}'"))
            
    req_ctx = accessor.request()
    if req_ctx and req_ctx.trace_id:
        conn.execute(text(f"SET LOCAL app.current_trace_id = '{req_ctx.trace_id}'"))

# Setup audit listeners
setup_audit_listeners(engine)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency that yields a database session.
    Note: RLS (SET LOCAL app.current_tenant_id) is applied dynamically 
    by the `begin` event listener whenever a transaction starts.
    """
    async with async_session_maker() as session:
        yield session
