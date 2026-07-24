FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

COPY . .

ENV PYTHONPATH=/app
ENV ENVIRONMENT=production

# Production server using uvicorn with more workers or gunicorn (simplified to uvicorn for this snippet)
CMD ["uv", "run", "uvicorn", "apps.api_gateway.src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
