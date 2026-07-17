import { PaymentService } from '../../services/payment.service';
import { PaymentRepository } from '../../repositories/payment.repository';
import { MockGateway } from '../../gateways/mock.gateway';
import { AuthClient } from '../../clients/auth.client';
import { OrderClient } from '../../clients/order.client';
import { PaymentStatus, PaymentMethod } from '../../models/payment';
import { Payment } from '../../models/payment.entity';

describe('PaymentService Unit Tests', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let mockGateway: MockGateway;
  let authClient: jest.Mocked<AuthClient>;
  let orderClient: jest.Mocked<OrderClient>;
  let paymentService: PaymentService;

  // Local storage mock DB
  let paymentsDb: Payment[] = [];

  beforeEach(() => {
    paymentsDb = [];

    // Mock PaymentRepository using jest.fn
    paymentRepository = {
      create: jest.fn().mockImplementation(async (data: any) => {
        const payment = new Payment();
        Object.assign(payment, {
          id: `pay-${Math.random().toString(36).substr(2, 9)}`,
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
      findByTransactionReference: jest.fn().mockImplementation(async (ref: string) => {
        return paymentsDb.find(p => p.transactionReference === ref) || null;
      }),
    } as any;

    // Mock AuthClient
    authClient = {
      validateToken: jest.fn(),
      getProfile: jest.fn(),
    } as any;

    // Mock OrderClient
    orderClient = {
      getOrder: jest.fn().mockImplementation(async (orderId: string) => {
        return {
          id: orderId,
          userId: 'test-user-id',
          status: 'PENDING',
          subtotal: 150.00,
          totalAmount: 150.00,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),
      updateOrderStatus: jest.fn().mockResolvedValue({}),
    } as any;

    // Disable gateway mock delays in test contexts
    mockGateway = new MockGateway({ forceDelayMs: 0 });

    paymentService = new PaymentService(
      paymentRepository as any,
      mockGateway,
      authClient as any,
      orderClient as any
    );
  });

  describe('processPayment', () => {
    it('should successfully process a payment with a valid card and save it', async () => {
      // Mock order details
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        status: 'PENDING',
        totalAmount: 150.00,
        subtotal: 150.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 150.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      const result = await paymentService.processPayment('test-user-id', 'mock-token', request);

      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.transactionReference).toBeDefined();
      expect(result.transactionReference.startsWith('TX-')).toBe(true);
      expect(result.orderId).toBe(request.orderId);

      const savedTx = paymentsDb.find(p => p.transactionReference === result.transactionReference);
      expect(savedTx).toBeDefined();
      expect(savedTx?.amount).toBe(request.amount);
      expect(savedTx?.status).toBe(PaymentStatus.SUCCESS);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith(request.orderId, 'PAID', 'mock-token');
    });

    it('should simulate decline and record FAILED status for a card ending in 9999', async () => {
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        status: 'PENDING',
        totalAmount: 250.00,
        subtotal: 250.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 250.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-9999',
      };

      const result = await paymentService.processPayment('test-user-id', 'mock-token', request);

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.transactionReference).toBeDefined();
      expect(result.transactionReference.startsWith('TX-')).toBe(true);

      const savedTx = paymentsDb.find(p => p.transactionReference === result.transactionReference);
      expect(savedTx).toBeDefined();
      expect(savedTx?.amount).toBe(request.amount);
      expect(savedTx?.status).toBe(PaymentStatus.FAILED);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith(request.orderId, 'PAYMENT_FAILED', 'mock-token');
    });

    it('should simulate decline and record FAILED status for amount 999.99', async () => {
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        status: 'PENDING',
        totalAmount: 999.99,
        subtotal: 999.99,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 999.99,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      const result = await paymentService.processPayment('test-user-id', 'mock-token', request);

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.transactionReference).toBeDefined();

      const savedTx = paymentsDb.find(p => p.transactionReference === result.transactionReference);
      expect(savedTx?.status).toBe(PaymentStatus.FAILED);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith(request.orderId, 'PAYMENT_FAILED', 'mock-token');
    });

    it('should throw NotFoundError if order is not found', async () => {
      orderClient.getOrder.mockResolvedValueOnce(null as any);

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 150.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      await expect(
        paymentService.processPayment('test-user-id', 'mock-token', request)
      ).rejects.toThrow('Order with ID 8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9 not found');
    });

    it('should throw AuthorizationError if order ownership mismatch', async () => {
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'different-user',
        status: 'PENDING',
        totalAmount: 150.00,
        subtotal: 150.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 150.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      await expect(
        paymentService.processPayment('test-user-id', 'mock-token', request)
      ).rejects.toThrow('You do not have permission to pay for this order');
    });

    it('should throw ValidationError if order status is already PAID (duplicate payment)', async () => {
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        status: 'PAID', // Already paid status
        totalAmount: 150.00,
        subtotal: 150.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 150.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      await expect(
        paymentService.processPayment('test-user-id', 'mock-token', request)
      ).rejects.toThrow('Order is not eligible for payment. Current status: PAID');
    });

    it('should throw ValidationError if order amount mismatch', async () => {
      orderClient.getOrder.mockResolvedValueOnce({
        id: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        status: 'PENDING',
        totalAmount: 150.00,
        subtotal: 150.00,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const request = {
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        amount: 100.00, // mismatch amount
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
      };

      await expect(
        paymentService.processPayment('test-user-id', 'mock-token', request)
      ).rejects.toThrow('Invalid payment amount');
    });

    it('should throw ConflictError for invalid status transition', async () => {
      // Create a mocked payment in repository that is FAILED
      const payment = await paymentRepository.create({
        orderId: '8c8b1d63-94de-4fd3-97e5-4e2d4d77d8c9',
        userId: 'test-user-id',
        amount: 150.00,
        currency: 'USD',
        paymentMethod: PaymentMethod.CARD,
        transactionReference: 'TX-FAILED-XYZ',
        gateway: 'MOCK',
        status: PaymentStatus.FAILED,
      });

      // Refunding a FAILED payment is an invalid transition
      await expect(
        paymentService.refundPayment(payment.id, 150.00, 'test-user-id', 'USER')
      ).rejects.toThrow('Invalid payment status transition from FAILED to REFUNDED');
    });
  });
});
