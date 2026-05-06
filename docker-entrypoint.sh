#!/bin/sh
set -e

echo "[entrypoint] Connecting to database at db:5432..."

# Run database operations based on environment
if [ "$NODE_ENV" = "development" ]; then
  # Construct the DATABASE_URL internally to ensure it's always correct
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

  echo "[entrypoint] Development mode - pushing schema..."
  pnpm exec prisma db push --accept-data-loss

  echo "[entrypoint] Generating Prisma client..."
  pnpm prisma generate

  echo "[entrypoint] Starting application in dev mode..."
  exec pnpm dev
else
  echo "[entrypoint] Production mode - running migrations..."
  pnpm prisma migrate deploy

  echo "[entrypoint] Starting application..."
  exec node dist/main.js
fi
