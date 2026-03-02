FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Full node_modules for Prisma CLI migrations (runs as root before USER switch)
COPY --from=deps /app/node_modules ./prisma-migrate/node_modules

# Standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uploads directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations as root (needs full deps), then drop to nextjs user for the app
CMD ["sh", "-c", "node prisma-migrate/node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma && su -s /bin/sh nextjs -c 'node server.js'"]
