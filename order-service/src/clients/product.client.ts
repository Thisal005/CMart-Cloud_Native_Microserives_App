import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError } from 'shared';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ProductExternalDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive?: boolean;
  createdAt: string;
}

export class ProductClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.productServiceUrl;
  }

  /**
   * Fetch product details by product ID from the Product Service.
   */
  public async getProductById(id: string): Promise<ProductExternalDto> {
    logger.info('External request started', { service: 'ProductService', requestType: 'GET', path: `/api/products/${id}` });
    try {
      const response = await axios.get<any>(`${this.baseUrl}/api/products/${id}`, {
        timeout: 5000,
      });
      logger.info('External request successful', { service: 'ProductService', requestType: 'GET', path: `/api/products/${id}`, success: true });
      return response.data.data;
    } catch (error: any) {
      logger.error('External request failed', error, { service: 'ProductService', requestType: 'GET', path: `/api/products/${id}`, success: false });
      this.handleError(error, `fetching product with ID ${id}`);
    }
  }

  /**
   * Check if a product is available and has sufficient stock.
   */
  public async checkAvailability(id: string, quantity: number): Promise<boolean> {
    const product = await this.getProductById(id);
    return product.stock >= quantity;
  }

  /**
   * Check if a product exists and is active.
   */
  public async isProductActive(id: string): Promise<boolean> {
    try {
      const product = await this.getProductById(id);
      return product.isActive !== false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || error.message;

      logger.warn(`Product client error during ${action}: [Status ${status}] ${message}`, {
        service: 'ProductService',
        action,
        status,
      });

      if (status === 404) {
        throw new NotFoundError(`Product not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Product validation failed: ${message}`);
      }
      throw new InternalServerError(`Product Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Product client communication failure during ${action}: ${error.message}`, error, {
      service: 'ProductService',
      action,
    });
    throw new InternalServerError(`Failed to communicate with Product Service during ${action}`);
  }
}
