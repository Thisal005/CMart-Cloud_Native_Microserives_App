import { ApiClient } from 'shared';
import { config } from '../config';

export interface ProcessPaymentDto {
  orderId: string;
  amount: number;
  paymentMethod: string;
  cardNumber: string;
}

export interface PaymentResultDto {
  status: 'SUCCESS' | 'FAILED';
  transactionId?: string;
  message?: string;
}

export class PaymentClient extends ApiClient {
  constructor() {
    super({
      serviceName: 'PaymentService',
      baseUrl: config.paymentServiceUrl,
      defaultTimeout: config.requestTimeout,
      retryCount: config.httpRetryCount,
      retryDelay: config.httpRetryDelay,
    });
  }

  /**
   * Request payment simulation from the Payment Service.
   */
  public async processPayment(token: string, dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    return this.request<PaymentResultDto>({
      url: '/api/v1/payments',
      method: 'POST',
      data: dto,
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
