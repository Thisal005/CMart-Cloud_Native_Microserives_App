import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './index';
import { User } from '../model/user';
import { CreateUsersTable1720267200000 } from '../migration/1720267200000-CreateUsersTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  entities: [User],
  migrations: [CreateUsersTable1720267200000],
  synchronize: false, // Never use synchronize in production — use migrations
  logging: process.env.NODE_ENV !== 'production',
  ssl: {
    rejectUnauthorized: false, // Required for Supabase hosted PostgreSQL
  },
});
