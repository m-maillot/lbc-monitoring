FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run web:build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create directories for config and data
RUN mkdir -p /app/config /app/data

# Copy necessary files
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
# Copy public directory if it exists
RUN mkdir -p ./web/public
COPY --from=builder --chown=node:node /app/web/public* ./web/ || true
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV CONFIG_PATH=/app/config/searches.json
ENV STORE_PATH=/app/data/seen-ads.json

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run Next.js server
CMD ["node", "web/server.js"]
