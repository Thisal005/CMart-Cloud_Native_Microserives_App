import dotenv from 'dotenv';
import { validateEnv } from 'shared';

dotenv.config();

const envSchema = {
  PORT: { type: 'number', required: false, default: 3002 },
  NODE_ENV: { type: 'string', required: false, default: 'development', choices: ['development', 'production', 'test'] },
  JWT_SECRET: { type: 'string', required: false, default: 'cmart-default-secret-key-1234567890-xyz' },
  LOG_LEVEL: { type: 'string', required: false, default: 'INFO', choices: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
  CORS_ORIGIN: { type: 'string', required: false, default: '*' },
} as const;

const env = validateEnv<any>(envSchema);

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  jwtSecret: env.JWT_SECRET,
  logLevel: env.LOG_LEVEL,
  corsOrigin: env.CORS_ORIGIN,
};
export default config;
