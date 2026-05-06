# ─── Stage 1: Base (Shared Dependencies) ──────────────────────────────────────
FROM node:25-alpine AS base

RUN npm install -g pnpm@latest
WORKDIR /app

# Install all dependencies (dev + prod) for building and testing
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and generate client so it's available to all stages
COPY prisma/ ./prisma/
RUN pnpm exec prisma generate


# ─── Stage 2: Development (Target for Docker Compose) ─────────────────────────
FROM base AS development

# Copy the entrypoint and configuration
COPY prisma.config.ts docker-entrypoint.sh nest-cli.json tsconfig.json tsconfig.build.json ./
RUN chmod +x docker-entrypoint.sh

# In dev, we mount 'src' via volumes in compose, but we need the entrypoint defined
ENTRYPOINT ["./docker-entrypoint.sh"]


# ─── Stage 3: Build (Compilation Only) ────────────────────────────────────────
FROM base AS builder

# Copy source and compile TypeScript
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src/ ./src/
RUN pnpm build


# ─── Stage 4: Production (Minimal Runtime) ────────────────────────────────────
FROM node:25-alpine AS production

RUN npm install -g pnpm@latest

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

WORKDIR /app

# Install ONLY production dependencies to keep the image small
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod \
  && pnpm store prune

# Copy runtime essentials
COPY prisma/ ./prisma/
COPY docker-entrypoint.sh prisma.config.ts ./

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client from base stage
COPY --from=base /app/generated ./generated

RUN chmod +x docker-entrypoint.sh \
  && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
