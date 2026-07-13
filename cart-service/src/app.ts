import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';
import { CartRepository } from './repository/cart.repository';
import { CartService } from './service/cart.service';
import { CartController } from './controller/cart.controller';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

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
