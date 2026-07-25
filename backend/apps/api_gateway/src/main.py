from fastapi import FastAPI, Response, status
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import redis
import os
from apps.api_gateway.src.routes import auth, tenant, routing, fleet, dashboard
from asgi_correlation_id import CorrelationIdMiddleware
from modules.core.observability.middleware import CorrelationMiddleware
from modules.core.logging.logger import setup_logging

# Setup structlog
setup_logging()

app = FastAPI(title="Stitch API Gateway", version="1.0.0")

app.add_middleware(CorrelationMiddleware)
app.add_middleware(CorrelationIdMiddleware)

app.include_router(auth.router)
app.include_router(tenant.router)
app.include_router(routing.router)
app.include_router(fleet.router)
app.include_router(dashboard.router)

# Database & Cache settings loaded directly from ENV for the Health Check
# In a real scenario, this would be imported from modules.core.config
DB_USER = os.getenv("DATABASE_USER", "stitch_admin")
DB_PASS = os.getenv("DATABASE_PASSWORD", "secret_postgres")
DB_HOST = os.getenv("DATABASE_HOST", "localhost")
DB_PORT = os.getenv("DATABASE_PORT", "5432")
DB_NAME = os.getenv("DATABASE_NAME", "stitch_db")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

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
        r = redis.Redis(host=REDIS_HOST, port=int(REDIS_PORT), socket_timeout=2)
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
