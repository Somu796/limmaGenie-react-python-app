# =============================================================
# Stage 1: BUILD
# Purpose: Install dependencies using uv (fast installer)
# This stage is temporary
# =============================================================
FROM python:3.12-slim AS builder

# Set working directory inside the container
WORKDIR /app

# Copy uv binary from its official image
# It only exists in this build stage, not in the final image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first (Docker layer caching optimization)
# If these files haven't changed, Docker reuses the cached layer
# and skips reinstalling dependencies — saves minutes on rebuilds
COPY pyproject.toml uv.lock ./

# Copy source code
COPY limmaGenie/ ./limmaGenie/
COPY app.py ./

# Install all dependencies + our package
# --system  : install into system Python (no venv needed in Docker)
# --no-cache: don't store download cache (keeps image smaller)
# -e .      : install limmaGenie package so imports work
RUN uv pip install --system --no-cache -e .


# =============================================================
# Stage 2: PRODUCTION
# Purpose: Clean, minimal image with only what's needed to run
# No build tools, no uv, no cache - just Python + limmaGenie app (FastAPI + Library)
# =============================================================
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN useradd --create-home appuser

# Copy installed Python packages from the build stage
# This is the key multi-stage benefit, here we get packages without
# any build tools, uv binary, or cache coming along
COPY --from=builder /usr/local/lib/python3.12/site-packages \
    /usr/local/lib/python3.12/site-packages

# Copy the uvicorn server binary (needed to run the app)
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# Copy our application code from the build stage
COPY --from=builder /app/limmaGenie ./limmaGenie
COPY --from=builder /app/app.py ./

# Switch to non-root user
USER appuser

# App listens on port 8000
EXPOSE 8000

# Start the FastAPI server
# app:app    -> from app.py, use the FastAPI object named 'app'
# --host     -> listen on all interfaces (required in Docker)
# --port     -> listen on port 8000
# --workers  -> spawn 4 processes for handling concurrent requests
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]