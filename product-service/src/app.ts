import express from 'express';
import cors from 'cors';
import { requestIdMiddleware, requestLogger, errorHandler, createMonitoringRouter } from 'shared';
import { logger } from './utils/logger';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { config } from './config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger(logger));

// Initialize dependencies
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Register Health, Readiness, and Version endpoints
app.use('/', createMonitoringRouter('product-service', [
  {
    name: 'configuration',
    check: async () => {
      const isConfigValid = config && typeof config.port === 'number';
      return {
        status: isConfigValid ? 'UP' : 'DOWN',
        details: { port: config?.port }
      };
    }
  }
]));

// Register routes
app.use('/api/products', productController.router);
app.use('/api/v1/products', productController.router);

// Register global error handler after all routes
app.use(errorHandler);

export default app;
export { productService }; // export instance if other components need local programmatic access in same runtime (or testing)
