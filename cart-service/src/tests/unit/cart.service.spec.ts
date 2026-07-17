import { CartService } from '../../services/cart.service';
import { CartRepository } from '../../repositories/cart.repository';
import { CartItemRepository } from '../../repositories/cart-item.repository';
import { ProductClient } from '../../clients/product.client';
import { Cart } from '../../models/cart.entity';
import { CartItem } from '../../models/cart-item.entity';
import { NotFoundError, ValidationError } from 'shared';

describe('CartService Unit Tests', () => {
  let cartService: CartService;
  let mockCartRepository: jest.Mocked<CartRepository>;
  let mockCartItemRepository: jest.Mocked<CartItemRepository>;
  let mockProductClient: jest.Mocked<ProductClient>;

  beforeEach(() => {
    // Instantiate mocked instances matching standard repository structures
    mockCartRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      deleteByUserId: jest.fn(),
    } as any;

    mockCartItemRepository = {
      findItemsByCartId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      updateQuantity: jest.fn(),
      deleteItemsByCartId: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockProductClient = {
      getProductById: jest.fn(),
      checkAvailability: jest.fn(),
      getProductPrice: jest.fn(),
      validateProductStatus: jest.fn(),
    } as any;

    // Use custom mocks in the service under test
    cartService = new CartService(mockCartRepository);
    (cartService as any).cartItemRepository = mockCartItemRepository;
    (cartService as any).productClient = mockProductClient;
  });

  describe('getCart', () => {
    it('should return existing cart and resolve product names', async () => {
      const mockCart = {
        id: 'cart-uuid-111',
        userId: 'user-uuid-999',
        items: [
          { productId: 'product-uuid-1', quantity: 2, unitPrice: 10.00 } as CartItem,
        ],
      } as Cart;

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Super Mouse',
        price: 10.00,
        stock: 5,
        isActive: true,
      } as any);

      const result = await cartService.getCart('user-uuid-999');

      expect(result).toBeDefined();
      expect(result.items[0].name).toBe('Super Mouse');
      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith('user-uuid-999');
      expect(mockProductClient.getProductById).toHaveBeenCalledWith('product-uuid-1');
    });

    it('should create and return a new cart if none exists', async () => {
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue({
        id: 'new-cart-uuid',
        userId: 'user-uuid-999',
        items: [],
      } as unknown as Cart);

      const result = await cartService.getCart('user-uuid-999');

      expect(result).toBeDefined();
      expect(result.id).toBe('new-cart-uuid');
      expect(mockCartRepository.create).toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    it('should successfully add a new item to cart', async () => {
      const mockCart = {
        id: 'cart-uuid-111',
        userId: 'user-uuid-999',
        items: [],
      } as unknown as Cart;

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Cool Keyboard',
        price: 89.99,
        stock: 15,
        isActive: true,
      } as any);
      mockCartRepository.save.mockResolvedValue(mockCart);

      const dto = { productId: 'product-uuid-1', quantity: 2 };
      const result = await cartService.addToCart('user-uuid-999', dto);

      expect(result).toBeDefined();
      expect(mockProductClient.getProductById).toHaveBeenCalledWith('product-uuid-1');
      expect(mockCartRepository.save).toHaveBeenCalled();
    });

    it('should increment quantity if item already exists in cart', async () => {
      const existingItem = { productId: 'product-uuid-1', quantity: 1, unitPrice: 89.99 } as CartItem;
      const mockCart = {
        id: 'cart-uuid-111',
        userId: 'user-uuid-999',
        items: [existingItem],
      } as unknown as Cart;

      mockCartRepository.findByUserId.mockResolvedValue(mockCart);
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Cool Keyboard',
        price: 89.99,
        stock: 15,
        isActive: true,
      } as any);
      mockCartRepository.save.mockResolvedValue(mockCart);

      const dto = { productId: 'product-uuid-1', quantity: 3 };
      await cartService.addToCart('user-uuid-999', dto);

      expect(existingItem.quantity).toBe(4);
      expect(mockCartRepository.save).toHaveBeenCalled();
    });

    it('should throw ValidationError if product is inactive', async () => {
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Inactive Screen',
        price: 199.99,
        stock: 5,
        isActive: false,
      } as any);

      const dto = { productId: 'product-uuid-1', quantity: 2 };
      await expect(cartService.addToCart('user-uuid-999', dto)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if stock is insufficient', async () => {
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Limited Screen',
        price: 199.99,
        stock: 1,
        isActive: true,
      } as any);

      const dto = { productId: 'product-uuid-1', quantity: 5 };
      await expect(cartService.addToCart('user-uuid-999', dto)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update quantity if item exists and belongs to user', async () => {
      const mockCart = { id: 'cart-uuid-111', userId: 'user-uuid-999', items: [] } as unknown as Cart;
      const mockItem = {
        id: 'item-uuid-777',
        productId: 'product-uuid-1',
        quantity: 2,
        cart: mockCart,
      } as unknown as CartItem;

      mockCartItemRepository.findById.mockResolvedValue(mockItem);
      mockProductClient.getProductById.mockResolvedValue({
        id: 'product-uuid-1',
        name: 'Cool Keyboard',
        price: 89.99,
        stock: 10,
        isActive: true,
      } as any);
      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.updateItemQuantity('user-uuid-999', 'item-uuid-777', 5);

      expect(result).toBeDefined();
      expect(mockItem.quantity).toBe(5);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(mockItem);
    });

    it('should throw NotFoundError if item does not belong to user', async () => {
      const mockCart = { id: 'cart-uuid-111', userId: 'other-user', items: [] } as unknown as Cart;
      const mockItem = {
        id: 'item-uuid-777',
        productId: 'product-uuid-1',
        quantity: 2,
        cart: mockCart,
      } as unknown as CartItem;

      mockCartItemRepository.findById.mockResolvedValue(mockItem);

      await expect(cartService.updateItemQuantity('user-uuid-999', 'item-uuid-777', 5)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if quantity is non-positive', async () => {
      await expect(cartService.updateItemQuantity('user-uuid-999', 'item-uuid-777', 0)).rejects.toThrow(ValidationError);
    });
  });

  describe('removeFromCart', () => {
    it('should successfully remove item if it exists and belongs to user', async () => {
      const mockCart = { id: 'cart-uuid-111', userId: 'user-uuid-999', items: [] } as unknown as Cart;
      const mockItem = {
        id: 'item-uuid-777',
        cart: mockCart,
      } as unknown as CartItem;

      mockCartItemRepository.findById.mockResolvedValue(mockItem);
      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.removeFromCart('user-uuid-999', 'item-uuid-777');

      expect(result).toBeDefined();
      expect(mockCartItemRepository.remove).toHaveBeenCalledWith('item-uuid-777');
    });

    it('should throw NotFoundError if item does not exist', async () => {
      mockCartItemRepository.findById.mockResolvedValue(null);

      await expect(cartService.removeFromCart('user-uuid-999', 'item-uuid-777')).rejects.toThrow(NotFoundError);
    });
  });
});
