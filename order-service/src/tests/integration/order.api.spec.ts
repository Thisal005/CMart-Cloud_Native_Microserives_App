import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { OrderController } from '../../controllers/order.controller';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.entity';
import { OrderStatus } from '../../models/order';
import { errorHandler } from 'shared';
import { config } from '../../config';

describe('Order API Integration Tests', () => {
  let app: express.Application;
  let mockOrderService: jest.Mocked<OrderService>;
  let userToken: string;
  let adminToken: string;

  const userId = 'user-uuid-123';
  const adminId = 'admin-uuid-456';

  beforeEach(() => {
    // Generate valid JWT tokens signed with config secret
    userToken = jwt.sign(
      { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      config.jwtSecret
    );

    adminToken = jwt.sign(
      { id: adminId, username: 'adminuser', email: 'admin@example.com', role: 'ADMIN' },
      config.jwtSecret
    );

    mockOrderService = {
      createOrder: jest.fn(),
      getOrderById: jest.fn(),
      getOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as any;

    const controller = new OrderController(mockOrderService);

    app = express();
    app.use(express.json());
    app.use('/api/v1/orders', controller.router);
    app.use(errorHandler);
  });

  describe('POST /api/v1/orders', () => {
    it('should return 401 if authorization token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .send({ shippingAddress: '123 Main St' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 201 with success response on valid checkout request', async () => {
      const mockOrder = {
        id: 'order-uuid-999',
        userId,
        subtotal: 150.0,
        totalAmount: 150.0,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
      } as unknown as Order;

      mockOrderService.createOrder.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress: '123 Street' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('order-uuid-999');
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(userId, userToken);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return 401 if unauthenticated', async () => {
      const response = await request(app).get('/api/v1/orders/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
      expect(response.status).toBe(401);
    });

    it('should return 400 if ID is not a valid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/orders/invalid-uuid-format')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('must be a valid UUID');
    });

    it('should return 200 with order details on valid owner retrieval', async () => {
      const mockOrder = {
        id: '99999999-9999-9999-9999-999999999999',
        userId,
        status: OrderStatus.PENDING,
      } as Order;

      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      const response = await request(app)
        .get('/api/v1/orders/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('99999999-9999-9999-9999-999999999999');
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('99999999-9999-9999-9999-999999999999', userId, 'USER');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return 200 with paginated structure on query list', async () => {
      mockOrderService.getOrders.mockResolvedValue({
        data: [{ id: 'order-1', userId, totalAmount: 100 } as any],
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/orders?page=1&limit=5&status=PENDING')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.totalItems).toBe(1);
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        userId,
        'USER',
        { status: OrderStatus.PENDING, targetUserId: undefined },
        1,
        5
      );
    });

    it('should return 400 if page or limit query parameters are invalid', async () => {
      const response = await request(app)
        .get('/api/v1/orders?page=-1&limit=abc')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/orders/:id/status', () => {
    it('should return 403 Forbidden for non-admin user status updates', async () => {
      const response = await request(app)
        .patch('/api/v1/orders/99999999-9999-9999-9999-999999999999/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: OrderStatus.PAID });

      expect(response.status).toBe(403);
      expect(mockOrderService.updateOrderStatus).not.toHaveBeenCalled();
    });

    it('should return 200 and call service transition as admin caller', async () => {
      const mockOrder = { id: '99999999-9999-9999-9999-999999999999', status: OrderStatus.PAID } as Order;
      mockOrderService.updateOrderStatus.mockResolvedValue(mockOrder);

      const response = await request(app)
        .patch('/api/v1/orders/99999999-9999-9999-9999-999999999999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: OrderStatus.PAID });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        '99999999-9999-9999-9999-999999999999',
        OrderStatus.PAID,
        adminId
      );
    });

    it('should return 400 validation error if status body property is invalid status value', async () => {
      const response = await request(app)
        .patch('/api/v1/orders/99999999-9999-9999-9999-999999999999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS_CODE' });

      expect(response.status).toBe(400);
    });
  });
});
