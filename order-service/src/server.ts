import dns from 'dns';
// Force IPv4 DNS resolution — Supabase may resolve to IPv6 only,
// which fails on networks without IPv6 support.
dns.setDefaultResultOrder('ipv4first');

import app from './app';
import { config } from './config';
import { AppDataSource } from './config/data-source';

async function bootstrap(): Promise<void> {
  try {
    // Only connect if a database URL is provided (allows offline start for testing)
    if (config.databaseUrl) {
      // Initialize database connection
      await AppDataSource.initialize();
      console.log('✅ Database connection established');

      // Run pending migrations
      await AppDataSource.runMigrations();
      console.log('✅ Database migrations executed');
    } else {
      console.log('⚠️ DATABASE_URL is not set. Database integration is disabled.');
    }

    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`🚀 Order Service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start Order Service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

bootstrap();

