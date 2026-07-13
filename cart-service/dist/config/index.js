"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3003', 10),
    jwtSecret: process.env.JWT_SECRET || 'cmart-default-secret-key-1234567890-xyz',
    productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    databaseUrl: process.env.DATABASE_URL || '',
    dbPoolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    dbPoolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    dbPoolConnectionTimeout: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
};
