import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'cmart-default-secret-key-1234567890-xyz',
  jwtExpiration: process.env.JWT_EXPIRATION || '15m',
  jwtRefreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS || '7', 10),
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  databaseUrl: process.env.DATABASE_URL || '',
};

