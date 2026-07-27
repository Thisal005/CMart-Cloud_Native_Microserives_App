# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace package and tsconfig definitions
COPY package*.json tsconfig.json ./
# Copy package.json for all workspaces first to leverage Docker layer caching
COPY shared/package*.json ./shared/
COPY order-service/package*.json ./order-service/

# Install ALL dependencies (cache this layer so it doesn't rebuild if only source code changes)
RUN npm ci

# Now copy the rest of the source code
COPY shared/ ./shared/
COPY order-service/ ./order-service/

# Build shared package first, then order-service
RUN npm run build -w shared
RUN npm run build -w order-service

# STAGE 2: Runner
FROM node:20-alpine AS runner

# Set production environment variable for faster Node.js execution
ENV NODE_ENV=production

WORKDIR /app

# Ensure the app directory is owned by the node user
RUN chown node:node /app

# Switch to non-root user earlier to ensure subsequent files have correct permissions
USER node

# Copy workspace configurations with correct ownership
COPY --chown=node:node package*.json ./
COPY --chown=node:node shared/package*.json ./shared/
COPY --chown=node:node order-service/package*.json ./order-service/

# Install ONLY production dependencies and clean cache to save space in the final image layer
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts from the builder stage with correct ownership
COPY --chown=node:node --from=builder /app/shared/dist ./shared/dist
COPY --chown=node:node --from=builder /app/order-service/dist ./order-service/dist

WORKDIR /app/order-service

EXPOSE 3004

CMD ["node", "dist/server.js"]