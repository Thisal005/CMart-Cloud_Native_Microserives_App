import { ProductService } from '../../src/service/product.service';
import { IProductRepository } from '../../src/repository/product-repository.interface';
import { Product } from '../../src/model/product';
import { NotFoundError, ConflictError, ValidationError } from 'shared';

describe('ProductService Unit Tests', () => {
  let productService: ProductService;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    // Manually create Jest mocked repository structure
    mockRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      skuExists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
    } as any;

    productService = new ProductService(mockRepository);
  });

  describe('createProduct', () => {
    it('should successfully create a product if SKU is unique', async () => {
      const dto = {
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: 89.50,
        stockQuantity: 10,
        description: 'Tactile mechanical keyboard',
        imageUrl: 'https://example.com/keyboard.jpg',
      };

      mockRepository.skuExists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        id: 'mock-uuid-1234',
        ...dto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product);

      const response = await productService.createProduct(dto);

      expect(response.success).toBe(true);
      expect(response.data?.sku).toBe(dto.sku);
      expect(response.data?.price).toBe(dto.price);
      expect(mockRepository.skuExists).toHaveBeenCalledWith(dto.sku);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if SKU already exists', async () => {
      const dto = {
        name: 'Duplicate Product',
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: 89.50,
        stockQuantity: 10,
      };

      mockRepository.skuExists.mockResolvedValue(true);

      await expect(productService.createProduct(dto)).rejects.toThrow(ConflictError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if name is empty', async () => {
      const dto = {
        name: '   ', // empty name
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: 89.50,
        stockQuantity: 10,
      };

      await expect(productService.createProduct(dto)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if price is negative', async () => {
      const dto = {
        name: 'Cheap Keyboard',
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: -5.00,
        stockQuantity: 10,
      };

      await expect(productService.createProduct(dto)).rejects.toThrow(ValidationError);
    });
  });

  describe('getProductById', () => {
    it('should return product details if product exists', async () => {
      const id = 'mock-uuid-1234';
      const mockProduct = {
        id,
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: 89.50,
        stockQuantity: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      mockRepository.findById.mockResolvedValue(mockProduct);

      const response = await productService.getProductById(id);

      expect(response.success).toBe(true);
      expect(response.data?.id).toBe(id);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundError if product does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById('unknown-uuid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProduct', () => {
    it('should update and return product details', async () => {
      const id = 'mock-uuid-1234';
      const initialProduct = {
        id,
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        sku: 'EL-KEYB-MECH-999',
        price: 89.50,
        stockQuantity: 10,
        isActive: true,
      } as Product;

      const updateDto = {
        name: 'RGB Mechanical Keyboard',
        price: 99.99,
      };

      mockRepository.findById.mockResolvedValue(initialProduct);
      mockRepository.update.mockResolvedValue({
        ...initialProduct,
        ...updateDto,
        updatedAt: new Date(),
      } as Product);

      const response = await productService.updateProduct(id, updateDto);

      expect(response.success).toBe(true);
      expect(response.data?.name).toBe(updateDto.name);
      expect(response.data?.price).toBe(updateDto.price);
    });
  });

  describe('softDeleteProduct', () => {
    it('should flag isActive as false and return success message', async () => {
      const id = 'mock-uuid-1234';
      const mockProduct = {
        id,
        name: 'Mechanical Keyboard',
        isActive: true,
      } as Product;

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.softDelete.mockResolvedValue(true);

      const response = await productService.softDeleteProduct(id);

      expect(response.success).toBe(true);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });
  });
});
