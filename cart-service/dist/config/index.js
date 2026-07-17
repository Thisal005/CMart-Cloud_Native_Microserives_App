"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("shared");
dotenv_1.default.config();
const envSchema = {
    PORT: { type: 'number', required: false, default: 3003 },
    NODE_ENV: { type: 'string', required: false, default: 'development', choices: ['development', 'production', 'test'] },
    DATABASE_URL: { type: 'string', required: true },
    JWT_SECRET: { type: 'string', required: false, default: 'cmart-default-secret-key-1234567890-xyz' },
    PRODUCT_SERVICE_URL: { type: 'string', required: true, default: 'http://localhost:3002' },
    DB_POOL_MAX: { type: 'number', required: false, default: 10 },
    DB_POOL_IDLE_TIMEOUT: { type: 'number', required: false, default: 30000 },
    DB_POOL_CONNECTION_TIMEOUT: { type: 'number', required: false, default: 2000 },
    LOG_LEVEL: { type: 'string', required: false, default: 'INFO', choices: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
    REQUEST_TIMEOUT: { type: 'number', required: false, default: 5000 },
    HTTP_RETRY_COUNT: { type: 'number', required: false, default: 3 },
    HTTP_RETRY_DELAY: { type: 'number', required: false, default: 1000 },
    CORS_ORIGIN: { type: 'string', required: false, default: '*' },
};
const env = (0, shared_1.validateEnv)(envSchema);
exports.config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.JWT_SECRET,
    productServiceUrl: env.PRODUCT_SERVICE_URL,
    dbPoolMax: env.DB_POOL_MAX,
    dbPoolIdleTimeout: env.DB_POOL_IDLE_TIMEOUT,
    dbPoolConnectionTimeout: env.DB_POOL_CONNECTION_TIMEOUT,
    logLevel: env.LOG_LEVEL,
    requestTimeout: env.REQUEST_TIMEOUT,
    httpRetryCount: env.HTTP_RETRY_COUNT,
    httpRetryDelay: env.HTTP_RETRY_DELAY,
    corsOrigin: env.CORS_ORIGIN,
};
