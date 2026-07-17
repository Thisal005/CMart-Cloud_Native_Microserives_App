import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler } from 'shared';
import { logger } from './utils/logger';
import { CartRepository } from './repositories/cart.repository';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'cart-service' });
});

// Register routes
app.use('/api/cart', cartController.router);
app.use('/api/v1/cart', cartController.router);

// Global error handler (must be registered after all routes)
app.use(errorHandler);

export default app;
