import express from 'express';
import cors from 'cors';
import { OrderRepository } from './repository/order.repository';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize dependencies
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service' });
});

// Register routes
app.use('/api/orders', orderController.router);

export default app;
