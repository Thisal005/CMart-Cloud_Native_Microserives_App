FROM node:20-alpine

WORKDIR /app

# Copy root workspace package and tsconfig definitions
COPY package*.json tsconfig.json ./
COPY shared/ ./shared/
COPY cart-service/package*.json ./cart-service/

# Install dependencies
RUN npm ci

# Copy cart-service source files
COPY cart-service/ ./cart-service/

# Build shared package first, then cart-service
RUN npm run build -w shared
RUN npm run build -w cart-service

WORKDIR /app/cart-service

EXPOSE 3003

USER node

CMD ["node", "dist/server.js"]

