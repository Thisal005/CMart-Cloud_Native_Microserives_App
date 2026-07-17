import { OrderService } from '../../services/order.service';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderItemRepository } from '../../repositories/order-item.repository';
import { CartClient } from '../../clients/cart.client';
import { ProductClient } from '../../clients/product.client';
import { AuthClient } from '../../clients/auth.client';
import { Order } from '../../models/order.entity';
import { OrderItem } from '../../models/order-item.entity';
import { OrderStatus } from '../../models/order';
import { NotFoundError, ValidationError, AuthorizationError } from 'shared';

describe('OrderService Unit Tests', () => {
  let orderService: OrderService;
  let mockOrderRepo: jest.Mocked<OrderRepository>;
  let mockOrderItemRepo: jest.Mocked<OrderItemRepository>;
  let mockCartClient: jest.Mocked<CartClient>;
  let mockProductClient: jest.Mocked<ProductClient>;
  let mockAuthClient: jest.Mocked<AuthClient>;

  const userId = 'user-uuid-123';
  const token = 'mock-jwt-token-xyz';

  beforeEach(() => {
    mockOrderRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      createInstance: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findWithPagination: jest.fn(),
    } as any;

    mockOrderItemRepo = {
      create: jest.fn(),
      save: jest.fn(),
      saveMultiple: jest.fn(),
      findByOrderId: jest.fn(),
      deleteByOrderId: jest.fn(),
    } as any;

    mockCartClient = {
      getCart: jest.fn(),
      clearCart: jest.fn(),
    } as any;

    mockProductClient = {
      getProductById: jest.fn(),
      checkAvailability: jest.fn(),
      isProductActive: jest.fn(),
    } as any;

    mockAuthClient = {
      validateToken: jest.fn(),
      getProfile: jest.fn(),
    } as any;

    orderService = new OrderService(
      mockOrderRepo,
      mockOrderItemRepo,
      mockCartClient,
      mockProductClient,
      mockAuthClient
    );
  });

  describe('createOrder', () => {
    it('should successfully create an order from user cart', async () => {
      // Setup mocked responses
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });

      mockCartClient.getCart.mockResolvedValue({
        id: 'cart-uuid',
        userId,
        items: [
          { productId: 'prod-1', name: 'Item One', price: 100.0, quantity: 2 },
          { productId: 'prod-2', name: 'Item Two', price: 50.0, quantity: 1 },
        ],
        totalAmount: 250.0,
      });

      mockProductClient.getProductById
        .mockResolvedValueOnce({
          id: 'prod-1',
          name: 'Item One Catalog',
          description: 'Desc 1',
          price: 100.0,
          stock: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: 'prod-2',
          name: 'Item Two Catalog',
          description: 'Desc 2',
          price: 50.0,
          stock: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
        });

      mockOrderRepo.createInstance.mockImplementation((data: any) => {
        const order = new Order();
        Object.assign(order, data);
        return order;
      });

      mockOrderRepo.save.mockImplementation(async (order: Order) => {
        order.id = 'new-order-uuid';
        return order;
      });

      mockCartClient.clearCart.mockResolvedValue(undefined);

      // Execute Checkout
      const result = await orderService.createOrder(userId, token);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-order-uuid');
      expect(result.subtotal).toBe(250.0);
      expect(result.totalAmount).toBe(250.0);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.items.length).toBe(2);

      // Verify Snapshot fields
      expect(result.items[0].productName).toBe('Item One Catalog');
      expect(result.items[0].unitPrice).toBe(100.0);
      expect(result.items[1].productName).toBe('Item Two Catalog');
      expect(result.items[1].unitPrice).toBe(50.0);

      // Verify flow invocations
      expect(mockAuthClient.validateToken).toHaveBeenCalledWith(token);
      expect(mockCartClient.getCart).toHaveBeenCalledWith(token);
      expect(mockProductClient.getProductById).toHaveBeenCalledTimes(2);
      expect(mockOrderRepo.save).toHaveBeenCalled();
      expect(mockCartClient.clearCart).toHaveBeenCalledWith(token);
    });

    it('should throw ValidationError if cart is empty', async () => {
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });
      mockCartClient.getCart.mockResolvedValue({ id: 'cart-uuid', userId, items: [], totalAmount: 0 });

      await expect(orderService.createOrder(userId, token)).rejects.toThrow(ValidationError);
      expect(mockOrderRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if product ID is empty', async () => {
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });
      mockCartClient.getCart.mockResolvedValue({
        id: 'cart-uuid',
        userId,
        items: [{ productId: '', name: 'Blank Product', price: 10, quantity: 1 }],
        totalAmount: 10,
      });

      await expect(orderService.createOrder(userId, token)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if quantity is 0 or negative', async () => {
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });
      mockCartClient.getCart.mockResolvedValue({
        id: 'cart-uuid',
        userId,
        items: [{ productId: 'prod-1', name: 'Item', price: 10, quantity: 0 }],
        totalAmount: 0,
      });

      await expect(orderService.createOrder(userId, token)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if product is inactive', async () => {
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });
      mockCartClient.getCart.mockResolvedValue({
        id: 'cart-uuid',
        userId,
        items: [{ productId: 'prod-1', name: 'Item', price: 10, quantity: 1 }],
        totalAmount: 10,
      });
      mockProductClient.getProductById.mockResolvedValue({
        id: 'prod-1',
        name: 'Item Catalog',
        description: 'Desc',
        price: 10,
        stock: 5,
        isActive: false,
        createdAt: new Date().toISOString(),
      });

      await expect(orderService.createOrder(userId, token)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if stock availability validation fails', async () => {
      mockAuthClient.validateToken.mockResolvedValue({
        valid: true,
        user: { id: userId, username: 'testuser', email: 'test@example.com', role: 'USER' },
      });
      mockCartClient.getCart.mockResolvedValue({
        id: 'cart-uuid',
        userId,
        items: [{ productId: 'prod-1', name: 'Item', price: 10, quantity: 10 }],
        totalAmount: 100,
      });
      mockProductClient.getProductById.mockResolvedValue({
        id: 'prod-1',
        name: 'Item Catalog',
        description: 'Desc',
        price: 10,
        stock: 3, // stock is less than 10
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      await expect(orderService.createOrder(userId, token)).rejects.toThrow(ValidationError);
    });
  });

  describe('getOrderById', () => {
    it('should successfully return order details if owner queries it', async () => {
      const mockOrder = { id: 'order-1', userId, status: OrderStatus.PENDING } as Order;
      mockOrderRepo.findById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-1', userId, 'USER');
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
    });

    it('should allow admin to view any order details', async () => {
      const mockOrder = { id: 'order-1', userId: 'another-user', status: OrderStatus.PENDING } as Order;
      mockOrderRepo.findById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-1', userId, 'ADMIN');
      expect(result).toBeDefined();
      expect(result.userId).toBe('another-user');
    });

    it('should throw AuthorizationError if non-admin queries another user\'s order', async () => {
      const mockOrder = { id: 'order-1', userId: 'another-user', status: OrderStatus.PENDING } as Order;
      mockOrderRepo.findById.mockResolvedValue(mockOrder);

      await expect(orderService.getOrderById('order-1', userId, 'USER')).rejects.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError if order does not exist', async () => {
      mockOrderRepo.findById.mockResolvedValue(null);
      await expect(orderService.getOrderById('missing-order', userId, 'USER')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getOrders', () => {
    it('should restrict user query scope to their own userId', async () => {
      mockOrderRepo.findWithPagination.mockResolvedValue({ data: [], total: 0 });

      await orderService.getOrders(userId, 'USER', { status: OrderStatus.PENDING });
      expect(mockOrderRepo.findWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ userId }),
        1,
        10
      );
    });

    it('should throw AuthorizationError if user queries with another target user_id', async () => {
      await expect(
        orderService.getOrders(userId, 'USER', { targetUserId: 'someone-else' })
      ).rejects.toThrow(AuthorizationError);
    });

    it('should allow admin to filter by another target user_id', async () => {
      mockOrderRepo.findWithPagination.mockResolvedValue({ data: [], total: 0 });

      await orderService.getOrders(userId, 'ADMIN', { targetUserId: 'someone-else' });
      expect(mockOrderRepo.findWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'someone-else' }),
        1,
        10
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should successfully transition status through valid path PENDING -> PAYMENT_PENDING', async () => {
      const mockOrder = { id: 'order-1', userId, status: OrderStatus.PENDING } as Order;
      mockOrderRepo.findById.mockResolvedValue(mockOrder);
      mockOrderRepo.save.mockImplementation(async (order: Order) => order);

      const result = await orderService.updateOrderStatus('order-1', OrderStatus.PAYMENT_PENDING, 'admin-id');
      expect(result.status).toBe(OrderStatus.PAYMENT_PENDING);
    });

    it('should throw ValidationError on invalid status transitions COMPLETED -> PENDING', async () => {
      const mockOrder = { id: 'order-1', userId, status: OrderStatus.COMPLETED } as Order;
      mockOrderRepo.findById.mockResolvedValue(mockOrder);

      await expect(
        orderService.updateOrderStatus('order-1', OrderStatus.PENDING, 'admin-id')
      ).rejects.toThrow(ValidationError);
    });
  });
});
