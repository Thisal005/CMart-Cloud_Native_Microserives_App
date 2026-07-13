import express from 'express';
import cors from 'cors';
import { ProductRepository } from './repository/product.repository';
import { ProductService } from './service/product.service';
import { ProductController } from './controller/product.controller';

const app = express();

app.use(cors());
app.use(express.json());

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

export default app;
export { productService }; // export instance if other components need local programmatic access in same runtime (or testing)
