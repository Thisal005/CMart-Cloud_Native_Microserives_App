import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler } from 'shared';
import { logger } from './utils/logger';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { CartClient } from './clients/cart.client';
import { ProductClient } from './clients/product.client';
import { AuthClient } from './clients/auth.client';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service' });
});

// Register routes
app.use('/api/orders', orderController.router);
app.use('/api/v1/orders', orderController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;

