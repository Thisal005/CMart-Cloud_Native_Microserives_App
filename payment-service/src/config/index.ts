import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  jwtSecret: process.env.JWT_SECRET || 'cmart-default-secret-key-1234567890-xyz',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  databaseUrl: process.env.DATABASE_URL || '',
  dbPoolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  dbPoolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  dbPoolConnectionTimeout: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000', 10),
  paymentGateway: process.env.PAYMENT_GATEWAY || 'MOCK',
};
export default config;
