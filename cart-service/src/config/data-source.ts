import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  entities: [join(__dirname, '..', 'model', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migration', '*.{ts,js}')],
  synchronize: false, // Never use synchronize in production — use migrations
  logging: process.env.NODE_ENV !== 'production',
  ssl: {
    rejectUnauthorized: false, // Required for Supabase hosted PostgreSQL
  },
  extra: {
    max: config.dbPoolMax,
    idleTimeoutMillis: config.dbPoolIdleTimeout,
    connectionTimeoutMillis: config.dbPoolConnectionTimeout,
  },
});
