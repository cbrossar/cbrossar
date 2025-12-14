FROM python:3.13-slim

WORKDIR /app

# Install system dependencies including PostgreSQL client tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Copy project configuration and lock file first to leverage Docker cache
COPY pyproject.toml uv.lock ./

# Copy the rest of the application
COPY . .

# Install dependencies and project using uv lock file for reproducible builds
RUN uv sync --frozen --no-dev

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

# Run the application
CMD ["python", "app.py"] 