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
COPY package.json package-lock.json next.config.mjs tsconfig.json postcss.config.mjs tailwind.config.ts ./
COPY prisma ./prisma/
COPY public ./public/
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Full node_modules for Prisma CLI migrations (runs as root before USER switch)
COPY --from=deps /app/node_modules ./prisma-migrate/node_modules

# Standalone output (read-only for app user)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN chown -R nextjs:nodejs .next && chmod -R 555 .next && \
    mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER nextjs

# Run migrations then start app (both as nextjs user — migrate deploy only needs DB access, not FS writes)
CMD ["sh", "-c", "node prisma-migrate/node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma && node server.js"]
