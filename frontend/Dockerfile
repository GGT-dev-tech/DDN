# ============================================================
# DDN OS — Frontend (Next.js) — Docker for Railway
# Uses Turborepo prune to build only @repo/web and its deps.
# ============================================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo@2

# ── Stage 1: Prune workspace ─────────────────────────────────
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/web --docker

# ── Stage 2: Install deps & build ───────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install ALL deps (including devDeps needed for build)
RUN npm ci

COPY --from=pruner /app/out/full/ .

# Build env vars
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

# BACKEND_URL will be passed at Railway build time as a build arg
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

RUN turbo run build --filter=@repo/web...

# ── Stage 3: Production runner ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public            ./apps/web/public

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
