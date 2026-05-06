#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrations..."
pnpm prisma migrate deploy

echo "[entrypoint] Starting application..."
exec node dist/main.js
