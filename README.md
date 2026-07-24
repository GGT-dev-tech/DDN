# Stitch Platform

Stitch is a modern waste management platform with a Modular Monolith backend powered by Python and FastAPI, and a React/Next.js frontend.

## Pre-requisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [uv](https://github.com/astral-sh/uv) (Python package and environment manager)
- [Node.js](https://nodejs.org/) v20+

## Quick Start (Backend)

1. **Setup Environment Variables:**
   ```bash
   cp backend/.env.example backend/.env.development
   ```

2. **Start Infrastructure (PostgreSQL & Redis):**
   ```bash
   docker compose --env-file backend/.env.development up -d
   ```

3. **Install dependencies:**
   ```bash
   cd backend
   uv sync
   ```

4. **Run the API Gateway:**
   ```bash
   # Make sure PYTHONPATH is set to the backend directory
   PYTHONPATH=$(pwd) uv run uvicorn apps.api_gateway.src.main:app --reload
   ```

## Quick Start (Frontend)

1. **Setup Environment Variables:**
   ```bash
   cp frontend/.env.example frontend/.env.development
   ```

2. **Install & Run (Pending Scaffold):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Commands

You can use the `Makefile` at the root of the project to simplify everyday tasks:

- `make dev`: Starts the infrastructure and API in development mode.
- `make test`: Runs the test suite using `pytest`.
- `make migrate`: Runs Alembic migrations.

## Code Quality & CI

Before committing, ensure your code passes the quality checks.
We use `pre-commit` hooks. To install them:
```bash
uv pip install pre-commit
pre-commit install
```

## Project Structure

- `backend/`: Core Modular Monolith API and Business Logic.
  - `apps/`: Deployable executable units (API Gateway, Workers).
  - `modules/`: DDD Bounded Contexts (identity, tenant, logistics, fleet, routing, etc).
  - `scripts/`: Local tools and helper scripts.
- `frontend/`: React UI apps.
- `docs/`: Technical documentation (ADRs, Business, API).
- `testing/`: Black-box, E2E, and Performance testing.
- `docker-compose.yml`: Local infrastructure orchestrator.
