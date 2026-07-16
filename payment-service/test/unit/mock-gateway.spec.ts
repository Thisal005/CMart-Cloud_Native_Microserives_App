import { MockGateway } from '../../src/gateway/mock.gateway';
import { PaymentMethod } from '../../src/model/payment';

describe('MockPaymentGateway Unit Tests', () => {
  describe('processPayment', () => {
    it('should return SUCCESS scenario when card is valid and failureRate is 0', async () => {
      const gateway = new MockGateway({ forceDelayMs: 0, failureRate: 0 });
      const request = {
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        amount: 100.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
        currency: 'USD',
        userId: 'user-123',
      };

      const result = await gateway.processPayment(request);

      expect(result.status).toBe('SUCCESS');
      expect(result.transactionId).toBeDefined();
      expect(result.transactionId.startsWith('TX-')).toBe(true);
      expect(result.message).toContain('Payment processed successfully');
      expect(result.rawResponse.cardLastFour).toBe('4444');
    });

    it('should return FAILED scenario when card number ends in 9999', async () => {
      const gateway = new MockGateway({ forceDelayMs: 0, failureRate: 0 });
      const request = {
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        amount: 100.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-9999', // decline card
        currency: 'USD',
        userId: 'user-123',
      };

      const result = await gateway.processPayment(request);

      expect(result.status).toBe('FAILED');
      expect(result.message).toContain('declined by issuing bank');
    });

    it('should return FAILED scenario when amount is 999.99', async () => {
      const gateway = new MockGateway({ forceDelayMs: 0, failureRate: 0 });
      const request = {
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        amount: 999.99, // decline amount
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
        currency: 'USD',
        userId: 'user-123',
      };

      const result = await gateway.processPayment(request);

      expect(result.status).toBe('FAILED');
      expect(result.message).toContain('declined by issuing bank');
    });

    it('should simulate delay correctly', async () => {
      const gateway = new MockGateway({ forceDelayMs: 50, failureRate: 0 });
      const request = {
        orderId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        amount: 100.00,
        paymentMethod: PaymentMethod.CARD,
        cardNumber: '1111-2222-3333-4444',
        currency: 'USD',
        userId: 'user-123',
      };

      const start = Date.now();
      await gateway.processPayment(request);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const gateway = new MockGateway({ forceDelayMs: 0 });
      const result = await gateway.verifyPayment('TX-123456');

      expect(result.status).toBe('SUCCESS');
      expect(result.transactionId).toBe('TX-123456');
    });
  });
});
