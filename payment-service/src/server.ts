import dns from 'dns';
// Force IPv4 DNS resolution — Supabase may resolve to IPv6 only,
// which fails on networks without IPv6 support.
dns.setDefaultResultOrder('ipv4first');

import app from './app';
import { config } from './config';
import { AppDataSource } from './config/data-source';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    // Only connect if a database URL is provided
    if (config.databaseUrl) {
      await AppDataSource.initialize();
      logger.info('✅ Database connection established (PaymentService)');
      await AppDataSource.runMigrations();
      logger.info('✅ Database migrations executed (PaymentService)');
    } else {
      logger.warn('⚠️ DATABASE_URL is not set. Database integration is disabled for PaymentService.');
    }

    // Start HTTP server
    app.listen(config.port, () => {
      logger.info(`🚀 Payment Service running on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error('❌ Failed to start Payment Service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down PaymentService...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received — shutting down PaymentService...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  }
  process.exit(0);
});

bootstrap();
