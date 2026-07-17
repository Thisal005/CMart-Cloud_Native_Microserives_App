import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { CartController } from '../../controllers/cart.controller';
import { CartService } from '../../services/cart.service';
import { CartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../models/cart.entity';
import { CartItem } from '../../models/cart-item.entity';
import { errorHandler } from 'shared';
import { config } from '../../config';

describe('Cart API Integration Tests', () => {
  let app: express.Application;
  let mockCartRepository: jest.Mocked<CartRepository>;
  let cartService: CartService;
  let authToken: string;

  beforeEach(() => {
    // Generate valid JWT token signed with config secret to pass shared authMiddleware
    authToken = jwt.sign(
      { id: 'user-uuid-999', username: 'nimali', email: 'nimali@gmail.com', role: 'USER' },
      config.jwtSecret
    );

    mockCartRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      deleteByUserId: jest.fn(),
    } as any;

    cartService = new CartService(mockCartRepository);
    const mockCartItemRepository = {
      remove: jest.fn(),
      findById: jest.fn(),
    } as any;
    (cartService as any).cartItemRepository = mockCartItemRepository;

    const mockProductClient = {
      getProductById: jest.fn(),
    } as any;
    (cartService as any).productClient = mockProductClient;

    const controller = new CartController(cartService);

    app = express();
    app.use(express.json());
    app.use('/api/v1/cart', controller.router);
    app.use(errorHandler);
  });

  describe('GET /api/v1/cart', () => {
    it('should return 200 with cart contents for authenticated user', async () => {
      const mockCart = {
        id: 'cart-uuid-1234',
        userId: 'user-uuid-999',
        items: [
          { productId: 'product-uuid-1', quantity: 2, unitPrice: 25.00 } as CartItem,
        ],
      } as unknown as Cart;

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      const mockProduct = { id: 'product-uuid-1', name: 'Product Name', price: 25.00, stock: 10, isActive: true };
      ((cartService as any).productClient.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('user-uuid-999');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Product Name');
    });

    it('should return 401 if authorization token is missing', async () => {
      const response = await request(app).get('/api/v1/cart');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should return 200 when adding valid item to cart', async () => {
      const mockCart = { id: 'cart-uuid-1234', userId: 'user-uuid-999', items: [] } as unknown as Cart;
      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      mockCartRepository.save.mockResolvedValue(mockCart);

      const mockProduct = { id: 'product-uuid-1', name: 'Mouse', price: 15.00, stock: 10, isActive: true };
      ((cartService as any).productClient.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: 'product-uuid-1', quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if quantity is invalid (negative)', async () => {
      const response = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: 'product-uuid-1', quantity: -5 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('PUT /api/v1/cart/items/:itemId', () => {
    it('should return 400 if target itemId path variable is not a valid UUID', async () => {
      const response = await request(app)
        .put('/api/v1/cart/items/invalid-item-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('valid UUID');
    });
  });
});
