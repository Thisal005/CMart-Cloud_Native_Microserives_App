import { ApiClient } from 'shared';
import { config } from '../config';

export interface CartItemExternalDto {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartExternalDto {
  id: string;
  userId: string;
  items: CartItemExternalDto[];
  totalAmount: number;
}

export class CartClient extends ApiClient {
  constructor() {
    super({
      serviceName: 'CartService',
      baseUrl: config.cartServiceUrl,
      defaultTimeout: config.requestTimeout,
      retryCount: config.httpRetryCount,
      retryDelay: config.httpRetryDelay,
    });
  }

  /**
   * Retrieve the current cart of the user.
   */
  public async getCart(token: string): Promise<CartExternalDto> {
    return this.request<CartExternalDto>({
      url: '/api/v1/cart',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Clear the user's cart after successful order creation and payment.
   */
  public async clearCart(token: string): Promise<void> {
    await this.request<void>({
      url: '/api/v1/cart',
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
