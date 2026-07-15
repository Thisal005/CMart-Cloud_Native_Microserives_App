import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError } from 'shared';
import { config } from '../config';
import { logger } from '../utils/logger';

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

export class PaymentClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.paymentServiceUrl;
  }

  /**
   * Request payment simulation from the Payment Service.
   */
  public async processPayment(token: string, dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    try {
      const response = await axios.post<PaymentResultDto>(`${this.baseUrl}/api/payments`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error, `processing payment for order ${dto.orderId}`);
    }
  }

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;

      logger.warn(`Payment client error during ${action}: [Status ${status}] ${message}`);

      if (status === 404) {
        throw new NotFoundError(`Payment endpoint not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Payment request validation failed: ${message}`);
      }
      throw new InternalServerError(`Payment Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Payment client communication failure during ${action}: ${error.message}`, error);
    throw new InternalServerError(`Failed to communicate with Payment Service during ${action}`);
  }
}
