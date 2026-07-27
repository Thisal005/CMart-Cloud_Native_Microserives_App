FROM node:20-alpine

WORKDIR /app

# Copy root workspace package and tsconfig definitions
COPY package*.json tsconfig.json ./
COPY shared/ ./shared/
COPY auth-service/package*.json ./auth-service/

# Install dependencies
RUN npm ci

# Copy auth-service source files
COPY auth-service/ ./auth-service/

# Build shared package first, then auth-service
RUN npm run build -w shared
RUN npm run build -w auth-service

WORKDIR /app/auth-service

EXPOSE 3001

USER node

CMD ["node", "dist/server.js"]

