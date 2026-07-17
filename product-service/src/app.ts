import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler } from 'shared';
import { logger } from './utils/logger';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'product-service' });
});

// Register routes
app.use('/api/products', productController.router);

// Register global error handler after all routes
app.use(errorHandler);

export default app;
export { productService }; // export instance if other components need local programmatic access in same runtime (or testing)
