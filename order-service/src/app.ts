import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler, createMonitoringRouter } from 'shared';
import { logger } from './utils/logger';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { CartClient } from './clients/cart.client';
import { ProductClient } from './clients/product.client';
import { AuthClient } from './clients/auth.client';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { AppDataSource } from './config/data-source';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const orderRepository = new OrderRepository();
const orderItemRepository = new OrderItemRepository();
const cartClient = new CartClient();
const productClient = new ProductClient();
const authClient = new AuthClient();

const orderService = new OrderService(
  orderRepository,
  orderItemRepository,
  cartClient,
  productClient,
  authClient
);
const orderController = new OrderController(orderService);

// Register Health, Readiness, and Version endpoints
app.use('/', createMonitoringRouter('order-service', [
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
app.use('/api/orders', orderController.router);
app.use('/api/v1/orders', orderController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;

