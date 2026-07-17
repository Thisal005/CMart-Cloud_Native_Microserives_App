import { ApiClient } from 'shared';
import { config } from '../config';

export interface ProductExternalDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive?: boolean;
  createdAt: string;
}

export class ProductClient extends ApiClient {
  constructor() {
    super({
      serviceName: 'ProductService',
      baseUrl: config.productServiceUrl,
      defaultTimeout: config.requestTimeout,
      retryCount: config.httpRetryCount,
      retryDelay: config.httpRetryDelay,
    });
  }

  /**
   * Fetch product details by product ID from the Product Service.
   */
  public async getProductById(id: string): Promise<ProductExternalDto> {
    return this.request<ProductExternalDto>({
      url: `/api/v1/products/${id}`,
      method: 'GET',
    });
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
}
