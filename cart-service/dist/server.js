"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
// Force IPv4 DNS resolution
dns_1.default.setDefaultResultOrder('ipv4first');
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const data_source_1 = require("./config/data-source");
async function bootstrap() {
    try {
        // Only connect if a database URL is provided
        if (config_1.config.databaseUrl) {
            await data_source_1.AppDataSource.initialize();
            console.log('✅ Database connection established (CartService)');
            await data_source_1.AppDataSource.runMigrations();
            console.log('✅ Database migrations executed (CartService)');
        }
        else {
            console.log('⚠️ DATABASE_URL is not set. Database integration is disabled for CartService.');
        }
        app_1.default.listen(config_1.config.port, () => {
            console.log(`🚀 Cart Service running on port ${config_1.config.port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start Cart Service:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down CartService...');
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed');
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received — shutting down CartService...');
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed');
    }
    process.exit(0);
});
bootstrap();
