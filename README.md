# Stitch Platform

Stitch is a modern waste management platform with a Modular Monolith backend powered by Python and FastAPI, and a React/Next.js frontend.

## Pre-requisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [uv](https://github.com/astral-sh/uv) (Python package and environment manager)

## Quick Start (Backend)

1. **Install dependencies:**
   ```bash
   cd backend
   uv sync
   ```

2. **Start Infrastructure (PostgreSQL & Redis):**
   ```bash
   cd docker
   docker compose --env-file ../.env.development up -d
   ```

3. **Run the API Gateway:**
   ```bash
   cd backend
   # Make sure PYTHONPATH is set to the backend directory
   PYTHONPATH=$(pwd) uv run uvicorn apps.api_gateway.src.main:app --reload
   ```

## Development Commands

You can use the `Makefile` at the root of the project to simplify everyday tasks:

- `make dev`: Starts the infrastructure and API in development mode.
- `make test`: Runs the test suite using `pytest`.
- `make migrate`: Runs Alembic migrations.
- `make lint`: Lints the codebase (placeholder for actual linter).

## Project Structure

- `backend/`: Core Modular Monolith API and Business Logic.
  - `apps/`: Deployable executable units (API Gateway, Workers).
  - `modules/`: DDD Bounded Contexts (identity, tenant, logistics, etc).
- `frontend/`: React/Next.js UI apps and shared packages.
- `docker/`: Container configurations and Docker Compose setup.
