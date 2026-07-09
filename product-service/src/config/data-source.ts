import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from './index';
import { Product } from '../model/product';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  entities: [Product],
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
