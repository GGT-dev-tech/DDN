# ADR-017: Railway Deployment

## Status
Accepted

## Context
Need a fast, predictable, and scalable PaaS for the Modular Monolith.

## Decision
Use Railway as the deployment platform. Configure multi-service definitions using native `railway.toml` inside `backend`, `frontend`, and `worker` directories.

## Consequences
- Easy provisioning of Postgres and Redis.
- Single source of truth for deployment config.
