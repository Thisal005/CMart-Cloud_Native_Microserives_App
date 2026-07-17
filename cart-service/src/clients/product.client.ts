import { ApiClient } from 'shared';
import { ProductExternalDto } from '../types/product-external.dto';
import { config } from '../config';

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
   * Retrieve the current price of a product.
   */
  public async getProductPrice(id: string): Promise<number> {
    const product = await this.getProductById(id);
    return product.price;
  }

  /**
   * Validate that the product exists.
   */
  public async validateProductStatus(id: string): Promise<boolean> {
    try {
      await this.getProductById(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
