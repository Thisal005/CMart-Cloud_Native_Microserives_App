FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY shared/ ./shared/
COPY order-service/package*.json ./order-service/

RUN npm ci

COPY order-service/ ./order-service/

RUN npm run build -w shared
RUN npm run build -w order-service

WORKDIR /app/order-service

EXPOSE 3004

USER node

CMD ["node", "dist/server.js"]