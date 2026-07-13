"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const index_1 = require("./index");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: index_1.config.databaseUrl,
    entities: [(0, path_1.join)(__dirname, '..', 'model', '*.entity.{ts,js}')],
    migrations: [(0, path_1.join)(__dirname, '..', 'migration', '*.{ts,js}')],
    synchronize: false, // Never use synchronize in production — use migrations
    logging: process.env.NODE_ENV !== 'production',
    ssl: {
        rejectUnauthorized: false, // Required for Supabase hosted PostgreSQL
    },
    extra: {
        max: index_1.config.dbPoolMax,
        idleTimeoutMillis: index_1.config.dbPoolIdleTimeout,
        connectionTimeoutMillis: index_1.config.dbPoolConnectionTimeout,
    },
});
