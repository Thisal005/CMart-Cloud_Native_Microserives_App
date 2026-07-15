import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';
import { OrderRepository } from './repository/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { CartClient } from './client/cart.client';
import { ProductClient } from './client/product.client';
import { AuthClient } from './client/auth.client';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';

const app = express();
/* this is a comment */
app.use(cors());
app.use(express.json());
app.use(requestLogger);

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

