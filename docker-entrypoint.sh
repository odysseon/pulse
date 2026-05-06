#!/bin/sh
set -e

# Run database operations based on environment
if [ "$NODE_ENV" = "development" ]; then

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
