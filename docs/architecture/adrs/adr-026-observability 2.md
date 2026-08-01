# ADR 026: Observability Strategy

## Context
Operating the Worker and the API in a distributed environment (Railway) requires deep visibility into requests, background processing, and failure rates.

## Decision
- **Structured Logging**: All logs must be in JSON format to be ingestible by observability platforms.
- **Context Injection**: Every log entry must include `tenant_id`, `user_id`, `trace_id`, and `correlation_id` when available.
- **Tracing**: Adopt OpenTelemetry (OTEL) for distributed tracing across FastAPI and the Celery Worker.
- **Metrics**: Expose Prometheus endpoints for business metrics (e.g., events processed, API latency).
- **Errors**: Centralize unhandled exceptions in Sentry.

## Consequences
- Requires instrumenting FastAPI middleware and Celery base tasks to propagate the `trace_id`.
- The `print()` statement is strictly banned across the codebase.
