FROM node:20-alpine

WORKDIR /app

# Copy root workspace package and tsconfig definitions
COPY package*.json tsconfig.json ./
COPY shared/ ./shared/
COPY product-service/package*.json ./product-service/

# Install dependencies
RUN npm ci

# Copy product-service source files
COPY product-service/ ./product-service/

# Build shared package first, then product-service
RUN npm run build -w shared
RUN npm run build -w product-service

WORKDIR /app/product-service

EXPOSE 3002

USER node

CMD ["node", "dist/server.js"]