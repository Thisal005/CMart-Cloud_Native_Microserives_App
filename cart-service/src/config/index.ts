import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  jwtSecret: process.env.JWT_SECRET || 'cmart-default-secret-key-1234567890-xyz',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
};
