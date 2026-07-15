import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3004', 10),
  jwtSecret: process.env.JWT_SECRET || 'cmart-default-secret-key-1234567890-xyz',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  cartServiceUrl: process.env.CART_SERVICE_URL || 'http://localhost:3003',
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  databaseUrl: process.env.DATABASE_URL || '',
  dbPoolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  dbPoolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  dbPoolConnectionTimeout: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
};

