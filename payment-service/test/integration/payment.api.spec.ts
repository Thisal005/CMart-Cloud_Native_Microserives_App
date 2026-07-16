import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PaymentController } from '../../src/controller/payment.controller';
import { PaymentService } from '../../src/service/payment.service';
import { PaymentRepository } from '../../src/repository/payment.repository';
import { OrderClient } from '../../src/client/order.client';
import { MockGateway } from '../../src/gateway/mock.gateway';
import { PaymentStatus, PaymentMethod } from '../../src/model/payment';
import { Payment } from '../../src/model/payment.entity';
import { errorHandler } from '../../src/middleware/error.middleware';
import { config } from '../../src/config';

describe('Payment API Integration Tests', () => {
  let app: express.Application;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;
  let mockOrderClient: jest.Mocked<OrderClient>;
  let mockGateway: MockGateway;
  let paymentService: PaymentService;
  let authToken: string;
  let adminToken: string;
  let paymentsDb: Payment[] = [];

  beforeEach(() => {
    paymentsDb = [];

    // Tokens
    authToken = jwt.sign(
      { id: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8', username: 'john', email: 'john@example.com', role: 'USER' },
      config.jwtSecret
    );
    adminToken = jwt.sign(
      { id: 'a4b3c2d1-e5f6-7a8b-9c0d-1e2f3a4b5c6d', username: 'admin', email: 'admin@example.com', role: 'ADMIN' },
      config.jwtSecret
    );

    // Mock Repositories
    mockPaymentRepository = {
      create: jest.fn().mockImplementation(async (data: any) => {
        const payment = new Payment();
        Object.assign(payment, {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        });
        paymentsDb.push(payment);
        return payment;
      }),
      save: jest.fn().mockImplementation(async (payment: any) => {
        const existingIdx = paymentsDb.findIndex(p => p.id === payment.id);
        if (existingIdx >= 0) {
          paymentsDb[existingIdx] = payment;
        } else {
          paymentsDb.push(payment);
        }
        return payment;
      }),
      findById: jest.fn().mockImplementation(async (id: string) => {
        return paymentsDb.find(p => p.id === id) || null;
      }),
      findByUserId: jest.fn().mockImplementation(async (userId: string) => {
        return paymentsDb.filter(p => p.userId === userId);
      }),
      findByOrderId: jest.fn().mockImplementation(async (orderId: string) => {
        return paymentsDb.filter(p => p.orderId === orderId);
      }),
      findWithPagination: jest.fn().mockImplementation(async (filters: any, pagination: any) => {
        const filtered = paymentsDb.filter(p => {
          if (filters.userId && p.userId !== filters.userId) return false;
          if (filters.status && p.status !== filters.status) return false;
          return true;
        });
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);
        return { data, total: filtered.length };
      }),
    } as any;

    // Mock Clients
    mockOrderClient = {
      getOrder: jest.fn().mockImplementation(async (orderId: string) => {
        return {
          id: orderId,
          userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
          status: 'PENDING',
          subtotal: 100.00,
          totalAmount: 100.00,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),
      updateOrderStatus: jest.fn().mockResolvedValue({}),
    } as any;

    const mockAuthClient = {} as any;

    // Mock Gateway
    mockGateway = new MockGateway({ forceDelayMs: 0, failureRate: 0 }); // ensure deterministic success

    paymentService = new PaymentService(
      mockPaymentRepository as any,
      mockGateway,
      mockAuthClient,
      mockOrderClient as any
    );

    const controller = new PaymentController(paymentService, mockOrderClient as any);

    app = express();
    app.use(express.json());
    app.use('/api/v1/payments', controller.router);
    app.use(errorHandler);
  });

  describe('POST /api/v1/payments', () => {
    it('should create and process payment successfully using details fetched from order client', async () => {
      const orderId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId,
          paymentMethod: PaymentMethod.CARD,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.orderId).toBe(orderId);
      expect(response.body.data.amount).toBe(100.00);
      expect(response.body.data.status).toBe(PaymentStatus.SUCCESS);
      expect(response.body.data.transactionReference).toBeDefined();
    });

    it('should return 400 validation error if orderId is missing or invalid', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: PaymentMethod.CARD,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should return 401 if unauthorized', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          paymentMethod: PaymentMethod.CARD,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 if a user tries to process payment for someone else\'s order', async () => {
      mockOrderClient.getOrder.mockResolvedValue({
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        status: 'PENDING',
        subtotal: 100.00,
        totalAmount: 100.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          paymentMethod: PaymentMethod.CARD,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 validation error if paymentMethod is unsupported', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          paymentMethod: 'BITCOIN',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('GET /api/v1/payments/:id', () => {
    it('should retrieve payment details by ID', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .get(`/api/v1/payments/${payment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(payment.id);
      expect(response.body.data.amount).toBe(100.00);
    });

    it('should return 403 if normal user tries to query another user\'s payment details', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        amount: 120.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-654321',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .get(`/api/v1/payments/${payment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow admin to query another user\'s payment details', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        amount: 120.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-654321',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .get(`/api/v1/payments/${payment.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(payment.id);
    });

    it('should return 404 if payment does not exist', async () => {
      const nonexistentId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
      const response = await request(app)
        .get(`/api/v1/payments/${nonexistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/payments/order/:orderId', () => {
    it('should retrieve payment history for an order', async () => {
      const orderId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
      await mockPaymentRepository.create({
        orderId,
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-11111',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .get(`/api/v1/payments/order/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].orderId).toBe(orderId);
    });
  });

  describe('GET /api/v1/payments', () => {
    it('should retrieve user\'s own paginated payments', async () => {
      await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c61',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 50.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-22222',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });
      await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c62',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 75.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-33333',
        gateway: 'MOCK',
        status: PaymentStatus.FAILED,
      });

      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should filter user\'s payments by status', async () => {
      await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c61',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 50.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-22222',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });
      await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c62',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 75.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-33333',
        gateway: 'MOCK',
        status: PaymentStatus.FAILED,
      });

      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: PaymentStatus.FAILED });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(PaymentStatus.FAILED);
    });
  });

  describe('POST /api/v1/payments/:id/refund', () => {
    it('should allow normal users to refund their own payment', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8', // owner
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .post(`/api/v1/payments/${payment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 50.00 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should deny refund request if a normal user tries to refund someone else\'s payment', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // different owner
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .post(`/api/v1/payments/${payment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`) // normal user is 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8'
        .send({ amount: 50.00 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should successfully process refund when requested by admin', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .post(`/api/v1/payments/${payment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`) // admin
        .send({ amount: 50.00 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should default to full amount if amount is not provided in body', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.SUCCESS,
      });

      const response = await request(app)
        .post(`/api/v1/payments/${payment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

    });

    it('should return 409 conflict error if trying to refund a failed payment', async () => {
      const payment = await mockPaymentRepository.create({
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        userId: 'd2050fa1-b1e6-42bb-8b9a-4c2847c2b3e8',
        amount: 100.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-123456',
        gateway: 'MOCK',
        status: PaymentStatus.FAILED,
      });

      const response = await request(app)
        .post(`/api/v1/payments/${payment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 50.00 });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('transition');
    });
  });
});
