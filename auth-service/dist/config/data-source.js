"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const index_1 = require("./index");
const user_1 = require("../model/user");
const refresh_token_1 = require("../model/refresh-token");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: index_1.config.databaseUrl,
    entities: [user_1.User, refresh_token_1.RefreshToken],
    migrations: [(0, path_1.join)(__dirname, '..', 'migration', '*.{ts,js}')],
    synchronize: false, // Never use synchronize in production — use migrations
    logging: process.env.NODE_ENV !== 'production',
    ssl: {
        rejectUnauthorized: false, // Required for Supabase hosted PostgreSQL
    },
});
