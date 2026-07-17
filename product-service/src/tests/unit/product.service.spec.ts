import { ProductService } from '../../services/product.service';
import { ProductRepository } from '../../repositories/product.repository';
import { Product } from '../../models/product';
import { NotFoundError, ValidationError } from 'shared';

describe('ProductService Unit Tests', () => {
  let productService: ProductService;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    // Manually create Jest mocked repository structure
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    productService = new ProductService(mockRepository);
  });

  describe('createProduct', () => {
    it('should successfully create a product', async () => {
      const dto = {
        name: 'Mechanical Keyboard',
        description: 'Tactile mechanical keyboard',
        price: 89.50,
        stock: 10,
      };

      const expectedProduct: Product = {
        id: 'mock-uuid-1234',
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedProduct);

      const response = await productService.createProduct(dto);

      expect(response).toEqual(expectedProduct);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
      });
    });

    it('should throw ValidationError if name is empty', async () => {
      const dto = {
        name: '   ', // empty name
        description: 'Empty name product',
        price: 89.50,
        stock: 10,
      };

      await expect(productService.createProduct(dto)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if price is negative', async () => {
      const dto = {
        name: 'Cheap Keyboard',
        description: 'Negative price product',
        price: -5.00,
        stock: 10,
      };

      await expect(productService.createProduct(dto)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if stock is negative', async () => {
      const dto = {
        name: 'Negative Stock Keyboard',
        description: 'Negative stock product',
        price: 89.50,
        stock: -1,
      };

      await expect(productService.createProduct(dto)).rejects.toThrow(ValidationError);
    });
  });

  describe('getProductById', () => {
    it('should return product details if product exists', async () => {
      const id = 'mock-uuid-1234';
      const mockProduct: Product = {
        id,
        name: 'Mechanical Keyboard',
        description: 'Tactile mechanical keyboard',
        price: 89.50,
        stock: 10,
        createdAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await productService.getProductById(id);

      expect(response).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundError if product does not exist', async () => {
      mockRepository.findById.mockResolvedValue(undefined);

      await expect(productService.getProductById('unknown-uuid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProduct', () => {
    it('should update and return product details', async () => {
      const id = 'mock-uuid-1234';
      const initialProduct: Product = {
        id,
        name: 'Mechanical Keyboard',
        description: 'Tactile mechanical keyboard',
        price: 89.50,
        stock: 10,
        createdAt: new Date(),
      };

      const updateDto = {
        name: 'RGB Mechanical Keyboard',
        price: 99.99,
      };

      mockRepository.findById.mockResolvedValue(initialProduct);
      mockRepository.update.mockResolvedValue({
        ...initialProduct,
        ...updateDto,
      });

      const response = await productService.updateProduct(id, updateDto);

      expect(response.name).toBe(updateDto.name);
      expect(response.price).toBe(updateDto.price);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and return void', async () => {
      const id = 'mock-uuid-1234';
      const mockProduct: Product = {
        id,
        name: 'Mechanical Keyboard',
        description: 'Tactile mechanical keyboard',
        price: 89.50,
        stock: 10,
        createdAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.delete.mockResolvedValue(true);

      await productService.deleteProduct(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
