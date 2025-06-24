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

