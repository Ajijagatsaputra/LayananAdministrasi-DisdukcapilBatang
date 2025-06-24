# # Stage 1: Build dependencies
# FROM python:3.11-slim AS builder

# # Set env
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1

# WORKDIR /app

# # Install build dependencies
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends build-essential

# # Copy requirements dan install ke venv lokal (optional)
# COPY requirements.txt .

# RUN pip install --user --no-cache-dir -r requirements.txt

# # Stage 2: Final stage (production image)
# FROM python:3.11-slim AS final

# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1

# WORKDIR /app

# # Salin hanya packages dari builder stage
# COPY --from=builder /root/.local /root/.local

# # Set PATH agar bisa akses installed packages
# ENV PATH=/root/.local/bin:$PATH

# # Copy source code
# COPY . .

# # Expose port
# EXPOSE 8000

# # Jalankan aplikasi (ubah sesuai framework lo)
# CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]


# -------- Stage 1: Builder --------
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y build-essential

# Copy requirements dan install dependencies ke /root/.local
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# -------- Stage 2: Final --------
FROM python:3.11-slim AS final

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/root/.local/bin:$PATH"

WORKDIR /app

# 🔥 Salin installed packages dari builder
COPY --from=builder /root/.local /root/.local

# Copy source code
COPY . .

EXPOSE 8000

# Run app
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]

