import { ApiClient } from 'shared';
import { config } from '../config';
import { OrderExternalDto } from '../types/order.dto';

export class OrderClient extends ApiClient {
  constructor() {
    super({
      serviceName: 'OrderService',
      baseUrl: config.orderServiceUrl,
      defaultTimeout: config.requestTimeout,
      retryCount: config.httpRetryCount,
      retryDelay: config.httpRetryDelay,
    });
  }

  /**
   * Fetch details of an order from the Order Service.
   */
  public async getOrder(id: string, token: string): Promise<OrderExternalDto> {
    return this.request<OrderExternalDto>({
      url: `/api/v1/orders/${id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Update the lifecycle status of an order (e.g. to PAID or PAYMENT_FAILED).
   */
  public async updateOrderStatus(id: string, status: string, token: string): Promise<OrderExternalDto> {
    return this.request<OrderExternalDto>({
      url: `/api/v1/orders/${id}/status`,
      method: 'PATCH',
      data: { status },
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
