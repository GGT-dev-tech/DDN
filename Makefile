.PHONY: dev test migrate lint clean

# Start infrastructure and run the API Gateway in development mode
dev:
	@echo "Starting infrastructure..."
	cd docker && docker compose --env-file ../.env.development up -d
	@echo "Starting API Gateway..."
	cd backend && PYTHONPATH=$$(pwd) uv run uvicorn apps.api_gateway.src.main:app --reload

# Run the test suite
test:
	@echo "Running tests..."
	cd backend && PYTHONPATH=$$(pwd) uv run pytest tests/ -v

# Run database migrations
migrate:
	@echo "Running migrations..."
	cd backend && PYTHONPATH=$$(pwd) uv run alembic upgrade head

# Run linters (currently empty, placeholder for Ruff/MyPy)
lint:
	@echo "Linting..."
	@echo "(Add ruff/mypy commands here)"

# Stop infrastructure
clean:
	@echo "Stopping infrastructure..."
	cd docker && docker compose --env-file ../.env.development down
