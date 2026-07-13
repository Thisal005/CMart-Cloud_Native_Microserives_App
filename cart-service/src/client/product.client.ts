import axios from 'axios';
import { NotFoundError, ValidationError, InternalServerError } from 'shared';
import { ProductExternalDto } from '../dto/product-external.dto';
import { config } from '../config';
import { logger } from '../utils/logger';

export class ProductClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.productServiceUrl;
  }

  /**
   * Fetch product details by product ID from the Product Service.
   */
  public async getProductById(id: string): Promise<ProductExternalDto> {
    try {
      const response = await axios.get<ProductExternalDto>(`${this.baseUrl}/api/products/${id}`);
      return response.data;
    } catch (error: any) {
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

  /**
   * Maps Axios exceptions to standard shared application error structures.
   */
  private handleError(error: any, action: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;

      logger.warn(`Product client error during ${action}: [Status ${status}] ${message}`);

      if (status === 404) {
        throw new NotFoundError(`Product not found: ${message}`);
      }
      if (status === 400) {
        throw new ValidationError(`Validation failed: ${message}`);
      }
      throw new InternalServerError(`Product Service returned unexpected status ${status} during ${action}`);
    }

    logger.error(`Product client communication failure during ${action}: ${error.message}`, error);
    throw new InternalServerError(`Failed to communicate with Product Service during ${action}`);
  }
}
