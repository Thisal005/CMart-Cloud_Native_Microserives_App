FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY shared/ ./shared/
COPY payment-service/package*.json ./payment-service/

RUN npm ci

COPY payment-service/ ./payment-service/

RUN npm run build -w shared
RUN npm run build -w payment-service

WORKDIR /app/payment-service

EXPOSE 3005

USER node

CMD ["node", "dist/server.js"]
