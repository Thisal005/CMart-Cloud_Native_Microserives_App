import request from 'supertest';
import express from 'express';
import { ProductController } from '../../controllers/product.controller';
import { ProductService } from '../../services/product.service';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from '../../models/product';
import { errorHandler } from 'shared';

describe('Product API Integration Tests', () => {
  let app: express.Application;
  let mockRepository: jest.Mocked<ProductRepository>;
  let productService: ProductService;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    productService = new ProductService(mockRepository);
    const controller = new ProductController(productService);

    app = express();
    app.use(express.json());
    app.use('/api/products', controller.router);
    app.use(errorHandler);
  });

  describe('GET /api/products', () => {
    it('should return 200 with all products', async () => {
      const mockProducts: Product[] = [
        {
          id: 'mock-uuid-1',
          name: 'Wireless Mouse',
          description: 'A quiet wireless mouse',
          price: 25.00,
          stock: 40,
          createdAt: new Date(),
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Wireless Mouse');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 200 with product if it exists', async () => {
      const mockProduct: Product = {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Wireless Mouse',
        description: 'A quiet wireless mouse',
        price: 25.00,
        stock: 40,
        createdAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get('/api/products/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('99999999-9999-9999-9999-999999999999');
    });

    it('should return 404 if product not found', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      const response = await request(app).get('/api/products/88888888-8888-8888-8888-888888888888');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});
