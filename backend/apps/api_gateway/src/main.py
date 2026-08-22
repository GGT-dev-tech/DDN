import os

import redis
from asgi_correlation_id import CorrelationIdMiddleware
from contextlib import asynccontextmanager
from fastapi import APIRouter, FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

from apps.api_gateway.src.routes import auth, dashboard, fleet, routing, tenant
from apps.api_gateway.src.routes.catalog import router as catalog_router
from apps.api_gateway.src.routes.commercial import router as commercial_router
from apps.api_gateway.src.routes.contracts import router as contracts_router
from apps.api_gateway.src.routes.destinations import router as destinations_router
from apps.api_gateway.src.routes.pricing import router as pricing_router
from apps.api_gateway.src.routes.public import router as public_router
from apps.api_gateway.src.routes.quotations import router as quotations_router
from apps.api_gateway.src.routes.service_plan import router as service_plan_router
from modules.billing.presentation.routes import router as billing_router
from modules.compliance.presentation.routes import router as compliance_router
from modules.core.logging.logger import setup_logging
from modules.core.observability.middleware import CorrelationMiddleware
from modules.logistics.presentation.routes import router as logistics_router

# Setup structlog
setup_logging()

from modules.core.config.settings import settings

DATABASE_URL = settings.db.url.replace("+asyncpg", "+psycopg") if "+asyncpg" in settings.db.url else settings.db.url

from apps.api_gateway.src.limiter import limiter
from modules.logistics.infrastructure.scheduler import start_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()

app = FastAPI(title="Stitch API Gateway", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CorrelationMiddleware)
app.add_middleware(CorrelationIdMiddleware)

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth.router)
api_v1.include_router(tenant.router)
api_v1.include_router(routing.router)
api_v1.include_router(fleet.router)
api_v1.include_router(dashboard.router)
api_v1.include_router(commercial_router)
api_v1.include_router(catalog_router)
api_v1.include_router(pricing_router)
api_v1.include_router(quotations_router)
api_v1.include_router(contracts_router)
api_v1.include_router(service_plan_router)
api_v1.include_router(destinations_router)
api_v1.include_router(logistics_router)
api_v1.include_router(compliance_router)
api_v1.include_router(billing_router)
api_v1.include_router(public_router)

app.include_router(api_v1)

# Remove duplicate env var declarations (moved to top)


@app.get("/health/live", tags=["Health"])
def health_live():
    """
    Indicates whether the application is running (Liveness).
    Used by orchestrators to know if the pod should be restarted.
    """
    return {"status": "alive"}

@app.get("/health/ready", tags=["Health"])
def health_ready(response: Response):
    """
    Indicates whether the application is ready to receive traffic (Readiness).
    Tests connections to critical dependencies: PostgreSQL and Redis.
    """
    health_status = {"postgres": "down", "redis": "down"}
    is_ready = True

    # Test Postgres Connection
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["postgres"] = "up"
    except OperationalError:
        is_ready = False
    except Exception:
        is_ready = False

    # Test Redis Connection
    try:
        r = redis.from_url(settings.db.redis_url, socket_timeout=2)
        if r.ping():
            health_status["redis"] = "up"
        else:
            is_ready = False
    except Exception:
        is_ready = False

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "not_ready",
        "dependencies": health_status
    }

@app.get("/health/startup", tags=["Health"])
def health_startup():
    """
    Indicates whether the application has finished its startup sequence.
    Useful for slow-starting applications to delay initial readiness probes.
    """
    # For now, if the app reaches here, it has started.
    # Later, this can check a global `is_initialized` flag set by lifespan events.
    return {"status": "started"}
