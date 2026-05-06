# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:25-alpine AS builder

RUN npm install -g pnpm@latest
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy configuration and source code
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma/ ./prisma/
COPY src/ ./src/

# Generate Prisma client (matches the output directory in your schema)
# And compile TypeScript to /dist
RUN pnpm exec prisma generate && pnpm build


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:25-alpine AS production

RUN npm install -g pnpm@latest

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

WORKDIR /app

# Install ONLY production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod \
  && pnpm add prisma \
  && pnpm store prune

# Copy runtime essentials
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY docker-entrypoint.sh ./

# Copy compiled code and the generated client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# Set permissions for the non-root user
RUN chmod +x docker-entrypoint.sh \
  && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# The entrypoint handles "prisma migrate deploy" before starting the server
ENTRYPOINT ["./docker-entrypoint.sh"]
