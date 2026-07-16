import {
  PaymentGateway,
  PaymentRequest,
  PaymentResult,
  RefundRequest,
  RefundResult,
} from './payment-gateway.interface';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface MockGatewayConfig {
  forceStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING';
  forceDelayMs?: number;
  failureRate?: number; // defaults to 0.2 (20%)
}

export class MockGateway implements PaymentGateway {
  private config: MockGatewayConfig;

  constructor(config: MockGatewayConfig = {}) {
    this.config = config;
    logger.info('Payment gateway initialized', { gateway: 'MOCK' });
  }

  /**
   * Helper to simulate network latency.
   */
  private async simulateDelay(): Promise<void> {
    const delay = this.config.forceDelayMs !== undefined
      ? this.config.forceDelayMs
      : Math.floor(Math.random() * 200) + 100; // randomized delay between 100-300ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Initializes a payment intent or checkout session.
   */
  public async initializePayment(request: PaymentRequest): Promise<{ paymentIntentId: string; clientSecret?: string; rawResponse?: any }> {
    logger.info('Gateway initialization started', { gateway: 'MOCK', orderId: request.orderId });
    await this.simulateDelay();

    const paymentIntentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
    const clientSecret = `seti_${crypto.randomBytes(16).toString('hex')}_secret_${crypto.randomBytes(4).toString('hex')}`;

    logger.info('Gateway initialization completed', { gateway: 'MOCK', orderId: request.orderId, paymentIntentId });

    return {
      paymentIntentId,
      clientSecret,
      rawResponse: {
        gateway: 'mock-gateway',
        initializedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Processes a payment transaction directly.
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    logger.info('Payment processing started', {
      gateway: 'MOCK',
      orderId: request.orderId,
      paymentMethod: request.paymentMethod,
    });

    await this.simulateDelay();

    const { amount, cardNumber } = request;
    let status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING';
    let message: string;

    // Deterministic outcome evaluation order:
    // 1. Force configuration override
    if (this.config.forceStatus) {
      status = this.config.forceStatus;
      message = `Payment status forced to ${status} via mock configuration override.`;
    } 
    // 2. Specific card/amount decline criteria (unit & E2E tests compatibility)
    else if (cardNumber && (cardNumber.endsWith('9999') || amount === 999.99)) {
      status = 'FAILED';
      message = 'Card was declined by issuing bank (simulated failure criteria).';
    } 
    // 3. Probabilistic outcome (80% Success, 20% Fail)
    else {
      const failureRate = this.config.failureRate ?? 0.2;
      const isDeclined = Math.random() < failureRate;
      status = isDeclined ? 'FAILED' : 'SUCCESS';
      message = isDeclined
        ? 'Transaction declined by payment processor (simulated 20% random failure).'
        : 'Payment processed successfully (simulated 80% random success).';
    }

    const transactionId = `TX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const result: PaymentResult = {
      status,
      transactionId,
      message,
      rawResponse: {
        gateway: 'mock-gateway',
        processedAt: new Date().toISOString(),
        requestAmount: amount,
        paymentMethod: request.paymentMethod,
        cardLastFour: cardNumber ? cardNumber.slice(-4) : 'XXXX',
      },
    };

    if (status === 'SUCCESS') {
      logger.info('Payment completed', { gateway: 'MOCK', orderId: request.orderId, transactionId });
    } else {
      logger.error('Payment failed', new Error(message), { gateway: 'MOCK', orderId: request.orderId, transactionId });
    }

    return result;
  }

  /**
   * Verifies the status of a transaction.
   */
  public async verifyPayment(transactionReference: string): Promise<PaymentResult> {
    logger.info('External verification request started', { gateway: 'MOCK', transactionReference });
    await this.simulateDelay();

    // Default mock verification logic: returns success
    const result: PaymentResult = {
      status: 'SUCCESS',
      transactionId: transactionReference,
      message: 'Transaction verified successfully via mock verification.',
      rawResponse: {
        verifiedAt: new Date().toISOString(),
      },
    };

    logger.info('External verification request successful', { gateway: 'MOCK', transactionReference });
    return result;
  }

  /**
   * Refunds a previously processed payment.
   */
  public async refundPayment(request: RefundRequest): Promise<RefundResult> {
    logger.info('External refund request started', { gateway: 'MOCK', transactionReference: request.transactionReference });
    await this.simulateDelay();

    const refundId = `re_${crypto.randomBytes(12).toString('hex')}`;
    const result: RefundResult = {
      status: 'SUCCESS',
      refundId,
      message: 'Refund executed successfully via mock gateway.',
      rawResponse: {
        refundedAmount: request.amount,
        reason: request.reason || 'Requested by user',
      },
    };

    logger.info('External refund request successful', { gateway: 'MOCK', transactionReference: request.transactionReference, refundId });
    return result;
  }
}
