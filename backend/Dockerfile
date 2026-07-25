FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies without installing the project itself
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application
COPY . .

# Ensure the start script is executable
RUN chmod +x scripts/start.sh

ENV PYTHONPATH=/app
ENV ENVIRONMENT=production

# Expose standard port (though Railway will provide its own PORT env var)
EXPOSE 8000

# Run the application through the start script
CMD ["./scripts/start.sh"]
