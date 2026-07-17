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
    PORT: { type: 'number', required: false, default: 3001 },
    NODE_ENV: { type: 'string', required: false, default: 'development', choices: ['development', 'production', 'test'] },
    DATABASE_URL: { type: 'string', required: true },
    JWT_SECRET: { type: 'string', required: false, default: 'cmart-default-secret-key-1234567890-xyz' },
    JWT_EXPIRES_IN: { type: 'string', required: false, default: '15m' },
    JWT_REFRESH_EXPIRES_DAYS: { type: 'number', required: false, default: 7 },
    BCRYPT_SALT_ROUNDS: { type: 'number', required: false, default: 12 },
    LOG_LEVEL: { type: 'string', required: false, default: 'INFO', choices: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
    CORS_ORIGIN: { type: 'string', required: false, default: '*' },
};
const env = (0, shared_1.validateEnv)(envSchema);
exports.config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRES_IN,
    jwtRefreshExpirationDays: env.JWT_REFRESH_EXPIRES_DAYS,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    logLevel: env.LOG_LEVEL,
    corsOrigin: env.CORS_ORIGIN,
};
