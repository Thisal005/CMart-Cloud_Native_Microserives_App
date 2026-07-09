import express from 'express';
import cors from 'cors';
import { CartRepository } from './repository/cart.repository';
import { CartService } from './service/cart.service';
import { CartController } from './controller/cart.controller';

const app = express();

app.use(cors());
app.use(express.json());

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

export default app;
