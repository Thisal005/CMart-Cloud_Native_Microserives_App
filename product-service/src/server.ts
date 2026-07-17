import dns from 'dns';
// Force IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first');

import app from './app';
import { config } from './config';

async function bootstrap(): Promise<void> {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Product Service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start Product Service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down ProductService...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received — shutting down ProductService...');
  process.exit(0);
});

bootstrap();
