#!/usr/bin/env bash
set -e

echo "Running Database Migrations..."
uv run alembic upgrade head

echo "Starting Uvicorn Server..."
# Execute the uvicorn process, replacing the bash process
exec uv run uvicorn apps.api_gateway.src.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 4
