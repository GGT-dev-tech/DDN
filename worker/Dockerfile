# Base Image
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install dependencies (to be done via uv later)
# COPY uv.lock pyproject.toml ./
# RUN uv sync --no-dev

# COPY backend/ .

# CMD ["celery", "-A", "backend.worker.celery_app", "worker", "-l", "info"]
