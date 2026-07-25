FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application
COPY . .

ENV PYTHONPATH=/app
ENV ENVIRONMENT=production

# The worker is not yet implemented, we just validate celery runs
CMD ["sh", "-c", "uv run celery --version && sleep 3600"]
