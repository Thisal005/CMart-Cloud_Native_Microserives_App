import request from 'supertest';
import express from 'express';
import { ProductController } from '../../src/controller/product.controller';
import { ProductService } from '../../src/service/product.service';
import { IProductRepository } from '../../src/repository/product-repository.interface';
import { Product } from '../../src/model/product';
import { errorHandler } from '../../src/middleware/error.middleware';

describe('Product API Integration Tests', () => {
  let app: express.Application;
  let mockRepository: jest.Mocked<IProductRepository>;
  let productService: ProductService;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      skuExists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
    } as any;

    productService = new ProductService(mockRepository);
    const controller = new ProductController(productService);

    app = express();
    app.use(express.json());
    app.use('/api/products', controller.router);
    app.use(errorHandler);
  });

  describe('GET /api/products (Search Products)', () => {
    it('should return 200 with search results', async () => {
      mockRepository.search.mockResolvedValue({
        data: [
          {
            id: 'mock-uuid-1',
            name: 'Wireless Mouse',
            sku: 'EL-MOUS-WIRE-111',
            category: 'Electronics',
            price: 25.00,
            stockQuantity: 40,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Product,
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const response = await request(app)
        .get('/api/products')
        .query({ searchTerm: 'Mouse', page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].sku).toBe('EL-MOUS-WIRE-111');
      expect(response.body.pagination.totalItems).toBe(1);
    });

    it('should return 400 if pagination limit exceeds 100', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ limit: 150 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.limit).toBeDefined();
    });

    it('should return 400 if sortBy parameter is invalid', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ sortBy: 'unknown_column' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details.sortBy).toBeDefined();
    });
  });

  describe('GET /api/products/:id (Get Product by ID)', () => {
    it('should return 200 with product if it exists', async () => {
      const mockProduct = {
        id: 'mock-uuid-1234',
        name: 'Wireless Mouse',
        sku: 'EL-MOUS-WIRE-111',
        category: 'Electronics',
        price: 25.00,
        stockQuantity: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get('/api/products/mock-uuid-1234');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('mock-uuid-1234');
    });

    it('should return 404 if product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const response = await request(app).get('/api/products/unknown-uuid');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
