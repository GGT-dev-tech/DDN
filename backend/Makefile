.PHONY: help install lint test check-architecture all

help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	uv pip install -e ".[dev]"

lint: ## Run import-linter
	lint-imports

test: ## Run integration and unit tests
	pytest tests/integration/

check-architecture: ## Run architecture tests and openapi snapshot check
	pytest tests/architecture/

permissions: ## Generate permissions documentation
	python scripts/generate_permissions_doc.py

all: lint check-architecture test permissions ## Run all checks (Fitness Functions)
