import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError } from 'shared';
import { config } from '../config';
import { logger } from '../utils/logger';

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

export class CartClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.cartServiceUrl;
  }

  /**
   * Retrieve the current cart of the user.
   */
  public async getCart(token: string): Promise<CartExternalDto> {
    logger.info('External request started', { service: 'CartService', requestType: 'GET', path: '/api/cart' });
    try {
      const response = await axios.get<CartExternalDto>(`${this.baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      logger.info('External request successful', { service: 'CartService', requestType: 'GET', path: '/api/cart', success: true });
      return response.data;
    } catch (error: any) {
      logger.error('External request failed', error, { service: 'CartService', requestType: 'GET', path: '/api/cart', success: false });
      this.handleError(error, 'fetching user cart');
    }
  }

  /**
   * Clear the user's cart after successful order creation and payment.
   */
  public async clearCart(token: string): Promise<void> {
    logger.info('External request started', { service: 'CartService', requestType: 'DELETE', path: '/api/cart' });
    try {
      await axios.delete(`${this.baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      logger.info('External request successful', { service: 'CartService', requestType: 'DELETE', path: '/api/cart', success: true });
    } catch (error: any) {
      logger.error('External request failed', error, { service: 'CartService', requestType: 'DELETE', path: '/api/cart', success: false });
      this.handleError(error, 'clearing user cart');
    }
  }

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || error.message;

      logger.warn(`Cart client error during ${action}: [Status ${status}] ${message}`, {
        service: 'CartService',
        action,
        status,
      });

      if (status === 404) {
        throw new NotFoundError(`Cart not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Cart validation failed: ${message}`);
      }
      throw new InternalServerError(`Cart Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Cart client communication failure during ${action}: ${error.message}`, error, {
      service: 'CartService',
      action,
    });
    throw new InternalServerError(`Failed to communicate with Cart Service during ${action}`);
  }
}
