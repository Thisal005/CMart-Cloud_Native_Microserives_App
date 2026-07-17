import { Product } from '../models/product';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductRequestDto, UpdateProductRequestDto } from '../types/product.dto';
import { NotFoundError, ValidationError, InternalServerError } from 'shared';

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  public async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return product;
  }

  public async createProduct(dto: CreateProductRequestDto): Promise<Product> {
    const { name, description, price, stock } = dto;

    if (!name || name.trim().length === 0 || price === undefined || stock === undefined) {
      throw new ValidationError('Name, price, and stock are required');
    }

    if (price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    return this.productRepository.create({
      name,
      description: description || '',
      price,
      stock,
    });
  }

  public async updateProduct(id: string, dto: UpdateProductRequestDto): Promise<Product> {
    // Ensure product exists
    await this.getProductById(id);

    if (dto.price !== undefined && dto.price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (dto.stock !== undefined && dto.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    const updated = await this.productRepository.update(id, dto);
    if (!updated) {
      throw new InternalServerError(`Failed to update product ${id}`);
    }
    return updated;
  }

  public async deleteProduct(id: string): Promise<void> {
    // Ensure product exists
    await this.getProductById(id);
    const success = await this.productRepository.delete(id);
    if (!success) {
      throw new InternalServerError(`Failed to delete product ${id}`);
    }
  }
}
