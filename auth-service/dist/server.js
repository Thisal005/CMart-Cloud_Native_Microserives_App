"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
// Force IPv4 DNS resolution — Supabase may resolve to IPv6 only,
// which fails on networks without IPv6 support.
dns_1.default.setDefaultResultOrder('ipv4first');
const app_1 = __importStar(require("./app"));
const config_1 = require("./config");
const data_source_1 = require("./config/data-source");
async function bootstrap() {
    try {
        // Initialize database connection
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        // Run pending migrations
        await data_source_1.AppDataSource.runMigrations();
        console.log('✅ Database migrations executed');
        // Register routes after DataSource is ready
        (0, app_1.registerRoutes)(app_1.default);
        // Start HTTP server
        app_1.default.listen(config_1.config.port, () => {
            console.log(`🚀 Auth Service running on port ${config_1.config.port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start Auth Service:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down...');
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed');
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received — shutting down...');
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed');
    }
    process.exit(0);
});
bootstrap();
