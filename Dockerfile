# ==============================================================================
# SafeRoute AI — Multi-Stage Dockerfile for Full-Stack Deployment
# Builds React frontend and serves everything via FastAPI on any cloud provider
# Compatible with: Render, Railway, Fly.io, Google Cloud Run, AWS App Runner
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the React Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Python 3.10 Runtime
# ------------------------------------------------------------------------------
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required for C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, data, and models
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default HTTP port
EXPOSE 8000
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Run Uvicorn listening on all network interfaces using the runtime $PORT
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
