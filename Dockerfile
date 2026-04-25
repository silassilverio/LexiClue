# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Stage 2: Build Rust backend ───────────────────────────────────────────────
FROM rust:1.86-slim AS backend-builder
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/ ./backend/
# Copy the built frontend so CARGO_MANIFEST_DIR/../frontend/dist is present at compile time
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
RUN cargo build --release

# ── Stage 3: Minimal runtime image ────────────────────────────────────────────
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=backend-builder /app/backend/target/release/lexiclue-backend /usr/local/bin/lexiclue-backend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app
ENV PORT=8080
EXPOSE 8080
CMD ["lexiclue-backend"]
