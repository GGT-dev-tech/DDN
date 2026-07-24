.PHONY: dev api worker beat lint format test coverage architecture migrate revision downgrade seed clean docs

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

api:
	cd backend && uv run uvicorn apps.api_gateway.src.main:app --reload --host 0.0.0.0 --port 8000

worker:
	cd backend && uv run celery -A backend.worker.celery_app worker -l info

beat:
	cd backend && uv run celery -A backend.worker.celery_app beat -l info

lint:
	cd backend && uv run ruff check . && uv run bandit -r . -c pyproject.toml

format:
	cd backend && uv run black . && uv run ruff check --fix .

test:
	cd backend && uv run pytest

coverage:
	cd backend && uv run pytest --cov=. --cov-report=term-missing --cov-report=xml

architecture:
	cd backend && uv run pytest tests/architecture

migrate:
	cd backend && uv run alembic upgrade head

revision:
	cd backend && uv run alembic revision --autogenerate -m "$(m)"

downgrade:
	cd backend && uv run alembic downgrade -1

seed:
	cd backend && uv run python scripts/seed/seed.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

docs:
	@echo "Docs generation not implemented yet."
