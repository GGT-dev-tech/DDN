FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune stitch-admin --docker

FROM base AS installer
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Build the project
COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=stitch-admin...

FROM base AS runner
WORKDIR /app

RUN npm install -g serve

# Copy the built assets from the builder stage
COPY --from=installer /app/apps/stitch-admin/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
