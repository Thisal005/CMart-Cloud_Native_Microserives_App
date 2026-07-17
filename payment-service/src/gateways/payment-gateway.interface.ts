export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: string;
  cardNumber: string;
  currency?: string;
  userId?: string;
}

export interface PaymentResult {
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING' | 'REFUNDED' | 'CANCELLED';
  transactionId: string;
  message: string;
  rawResponse?: any;
}

export interface RefundRequest {
  transactionReference: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  status: 'SUCCESS' | 'FAILED';
  refundId: string;
  message: string;
  rawResponse?: any;
}

export interface PaymentGateway {
  /**
   * Initializes a payment intent or checkout session.
   */
  initializePayment(request: PaymentRequest): Promise<{ paymentIntentId: string; clientSecret?: string; rawResponse?: any }>;

  /**
   * Processes a payment transaction directly.
   */
  processPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Verifies the status of a transaction with the gateway.
   */
  verifyPayment(transactionReference: string): Promise<PaymentResult>;

  /**
   * Refunds a previously processed payment.
   */
  refundPayment(request: RefundRequest): Promise<RefundResult>;
}
