import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError, AuthenticationError } from 'shared';
import { config } from '../config';
import { logger } from '../utils/logger';
import { OrderExternalDto } from '../types/order.dto';

export class OrderClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.orderServiceUrl;
  }

  /**
   * Fetch details of an order from the Order Service.
   */
  public async getOrder(id: string, token: string): Promise<OrderExternalDto> {
    const startTime = Date.now();
    logger.info('External request started', { service: 'OrderService', operation: `getOrder:${id}` });
    try {
      const response = await axios.get<any>(`${this.baseUrl}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      const duration = Date.now() - startTime;
      logger.info('External request successful', { service: 'OrderService', operation: `getOrder:${id}`, duration, success: true });
      
      // Unwrap standardized response metadata
      return response.data.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('External request failed', error, { service: 'OrderService', operation: `getOrder:${id}`, duration, success: false });
      this.handleError(error, `fetching order ${id}`);
    }
  }

  /**
   * Update the lifecycle status of an order (e.g. to PAID or PAYMENT_FAILED).
   */
  public async updateOrderStatus(id: string, status: string, token: string): Promise<OrderExternalDto> {
    const startTime = Date.now();
    logger.info('External request started', { service: 'OrderService', operation: `updateOrderStatus:${id}:${status}` });
    try {
      const response = await axios.patch<any>(
        `${this.baseUrl}/api/orders/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      const duration = Date.now() - startTime;
      logger.info('External request successful', { service: 'OrderService', operation: `updateOrderStatus:${id}:${status}`, duration, success: true });
      
      // Unwrap standardized response metadata
      return response.data.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('External request failed', error, { service: 'OrderService', operation: `updateOrderStatus:${id}:${status}`, duration, success: false });
      this.handleError(error, `updating status of order ${id} to ${status}`);
    }
  }

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || error.message;

      logger.warn(`Order client error during ${action}: [Status ${status}] ${message}`, {
        service: 'OrderService',
        action,
        status,
      });

      if (status === 401) {
        throw new AuthenticationError(`Unauthorized: ${message}`);
      }
      if (status === 404) {
        throw new NotFoundError(`Order resource not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Order validation failed: ${message}`);
      }
      throw new InternalServerError(`Order Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Order client communication failure during ${action}: ${error.message}`, error, {
      service: 'OrderService',
      action,
    });
    throw new InternalServerError(`Failed to communicate with Order Service during ${action}`);
  }
}
