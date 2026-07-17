import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler, createMonitoringRouter } from 'shared';
import { logger } from './utils/logger';
import { CartRepository } from './repositories/cart.repository';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { AppDataSource } from './config/data-source';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

// Register Health, Readiness, and Version endpoints
app.use('/', createMonitoringRouter('cart-service', [
  {
    name: 'database',
    check: async () => {
      if (!AppDataSource.isInitialized) {
        return { status: 'DOWN', details: { message: 'Database connection is not initialized' } };
      }
      try {
        await AppDataSource.query('SELECT 1');
        return { status: 'UP' };
      } catch (err: any) {
        return { status: 'DOWN', details: { message: err.message || 'Database query failed' } };
      }
    }
  }
]));

// Register routes
app.use('/api/cart', cartController.router);
app.use('/api/v1/cart', cartController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;
