#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
pnpm exec prisma migrate deploy

echo "[entrypoint] Generating client..."
pnpm exec prisma generate

echo "[entrypoint] Starting dev server..."
exec pnpm dev
