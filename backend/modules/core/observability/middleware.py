import time
from datetime import UTC, datetime

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from uuid6 import uuid7

from modules.core.context import RequestContext, reset_request_context, set_request_context

logger = structlog.get_logger()

def generate_trace_id() -> str:
    # A simple OTEL-like trace ID (32 hex characters)
    return uuid7().hex + uuid7().hex

class CorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started_at = datetime.now(UTC)
        start_time = time.perf_counter()
        
        request_id = uuid7()
        trace_id = request.headers.get("x-trace-id") or generate_trace_id()
        
        ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        ctx = RequestContext(
            request_id=request_id,
            trace_id=trace_id,
            ip=ip,
            user_agent=user_agent,
            path=request.url.path,
            method=request.method,
            started_at=started_at
        )
        
        token = set_request_context(ctx)
        
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=str(request_id),
            trace_id=trace_id,
            path=request.url.path,
            method=request.method,
            ip=ip
        )
        
        try:
            response = await call_next(request)
            
            process_time = time.perf_counter() - start_time
            response.headers["X-Request-ID"] = str(request_id)
            response.headers["X-Trace-ID"] = trace_id
            response.headers["X-Process-Time"] = str(process_time)
            
            # Log the request completion
            logger.info(
                "request_completed",
                status_code=response.status_code,
                duration_s=process_time
            )
            
            return response
        finally:
            reset_request_context(token)
