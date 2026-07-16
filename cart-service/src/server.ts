import dns from 'dns';
// Force IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first');

import app from './app';
import { config } from './config';
import { AppDataSource } from './config/data-source';

async function bootstrap(): Promise<void> {
  try {
    // Only connect if a database URL is provided
    if (config.databaseUrl) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established (CartService)');
      await AppDataSource.runMigrations();
      console.log('✅ Database migrations executed (CartService)');
    } else {
      console.log('⚠️ DATABASE_URL is not set. Database integration is disabled for CartService.');
    }

    app.listen(config.port, () => {
      console.log(`🚀 Cart Service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start Cart Service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down CartService...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down CartService...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

bootstrap();
