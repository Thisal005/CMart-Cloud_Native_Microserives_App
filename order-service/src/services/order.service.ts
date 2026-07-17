import { NotFoundError, ValidationError, AuthorizationError } from 'shared';
import { Order } from '../models/order.entity';
import { OrderItem } from '../models/order-item.entity';
import { OrderStatus } from '../models/order';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { CartClient } from '../clients/cart.client';
import { ProductClient } from '../clients/product.client';
import { AuthClient } from '../clients/auth.client';
import { logger } from '../utils/logger';

export class OrderService {
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;
  private cartClient: CartClient;
  private productClient: ProductClient;
  private authClient: AuthClient;

  constructor(
    orderRepository: OrderRepository,
    orderItemRepository: OrderItemRepository,
    cartClient: CartClient,
    productClient: ProductClient,
    authClient: AuthClient
  ) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.cartClient = cartClient;
    this.productClient = productClient;
    this.authClient = authClient;
  }

  /**
   * Create an order from the user's current cart details.
   */
  public async createOrder(userId: string, token: string): Promise<Order> {
    logger.info('Order creation started', { userId });

    // 1. Validate user identity via Auth Service
    try {
      const authValidation = await this.authClient.validateToken(token);
      if (!authValidation.valid || authValidation.user.id !== userId) {
        logger.error('Order creation failed: Invalid user token', undefined, { userId });
        throw new ValidationError('Invalid user token or unauthorized checkout attempt');
      }
    } catch (err: any) {
      logger.error('Order creation failed: Auth Service validation exception', err, { userId });
      throw err;
    }

    // 2. Fetch the user's cart from the Cart Service
    let cart;
    try {
      cart = await this.cartClient.getCart(token);
      logger.info('Cart retrieved successfully', { userId, cartId: cart?.id, itemsCount: cart?.items?.length });
    } catch (err: any) {
      logger.error('Order creation failed: Failed to retrieve cart', err, { userId });
      throw err;
    }

    // 3. Validation: A user cannot create empty orders
    if (!cart || !cart.items || cart.items.length === 0) {
      logger.error('Order creation failed: Cart is empty', undefined, { userId });
      throw new ValidationError('Cannot place an order with an empty shopping cart');
    }

    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    // 4. Validate and build each item snapshot
    for (const cartItem of cart.items) {
      const { productId, quantity } = cartItem;

      // Validation: Product IDs cannot be empty
      if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
        logger.error('Order creation failed: Product ID cannot be empty', undefined, { userId });
        throw new ValidationError('Product ID cannot be empty within the order');
      }

      // Validation: A user cannot create orders with invalid quantities
      if (quantity === undefined || quantity === null || quantity <= 0) {
        logger.error('Order creation failed: Invalid quantity', undefined, { userId, productId, quantity });
        throw new ValidationError(`Invalid quantity (${quantity}) specified for product ${productId}`);
      }

      // Fetch product info from Product Service
      let product;
      try {
        product = await this.productClient.getProductById(productId);
      } catch (err: any) {
        logger.error('Order creation failed: Product not found', err, { userId, productId });
        throw err;
      }

      // Validation: A user cannot create orders with inactive products
      if (product.isActive === false) {
        logger.error('Order creation failed: Product is inactive', undefined, { userId, productId });
        throw new ValidationError(`Product "${product.name}" is currently inactive and cannot be ordered`);
      }

      // Validation: A user cannot create orders with quantity exceeding available stock
      if (product.stock < quantity) {
        logger.error('Order creation failed: Insufficient stock', undefined, {
          userId,
          productId,
          stock: product.stock,
          requested: quantity,
        });
        throw new ValidationError(`Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${quantity}`);
      }

      // Calculate totals for the item snapshot
      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * quantity;
      calculatedSubtotal += itemSubtotal;

      // Instantiate the OrderItem entity (snapshot value persistence)
      const orderItem = new OrderItem();
      orderItem.productId = productId;
      orderItem.productName = product.name; // Snapshot product name
      orderItem.unitPrice = unitPrice;      // Snapshot price
      orderItem.quantity = quantity;
      orderItem.subtotal = itemSubtotal;

      orderItems.push(orderItem);
    }

    logger.info('Product validation completed', { userId, itemsCount: orderItems.length });

    // 5. Calculate Order subtotal and total amount (in this context, additional charges = 0)
    const totalAmount = calculatedSubtotal; 

    // Create the Order parent entity in PENDING status
    const order = this.orderRepository.createInstance({
      userId,
      items: orderItems,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: OrderStatus.PENDING,
    });

    // Save the order to persistence
    let savedOrder: Order;
    try {
      savedOrder = await this.orderRepository.save(order);
      logger.info('Order created successfully', {
        orderId: savedOrder.id,
        userId,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
      });
    } catch (err: any) {
      logger.error('Order creation failed: Database save error', err, { userId });
      throw err;
    }

    // 6. Clear user cart asynchronously after successful order save
    try {
      await this.cartClient.clearCart(token);
      logger.info('Cart cleared successfully post-checkout', { userId, orderId: savedOrder.id });
    } catch (err: any) {
      // Don't fail the order checkout flow if cart clearing fails, but log the alert
      logger.error('Failed to clear cart post-checkout', err, { userId, orderId: savedOrder.id });
    }

    return savedOrder;
  }

  /**
   * Retrieve a specific order by ID. Enforces ownership authorization rules.
   */
  public async getOrderById(id: string, userId: string, userRole: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    // Authorization: User can only view their own orders unless they are an admin
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      logger.warn('Unauthorized access attempt: Order ownership violation', {
        userId,
        userRole,
        orderId: id,
        ownerId: order.userId,
      });
      throw new AuthorizationError('You do not have permission to view this order');
    }

    return order;
  }

  /**
   * Retrieve all orders with filters and pagination. Enforces authorization/scoping:
   * Users can only see their own orders; Admins can see all orders or filter by a specific user.
   */
  public async getOrders(
    userId: string,
    userRole: string,
    filters: { status?: OrderStatus; createdDate?: Date; targetUserId?: string },
    page = 1,
    limit = 10
  ): Promise<{ data: Order[]; total: number }> {
    // Admins can query all orders or filter by targetUserId; regular users are locked to their own userId
    const scopedUserId = userRole === 'ADMIN' ? filters.targetUserId : userId;

    if (userRole !== 'ADMIN' && filters.targetUserId && filters.targetUserId !== userId) {
      logger.warn('Unauthorized access attempt: Query scope violation', {
        userId,
        userRole,
        targetUserId: filters.targetUserId,
      });
      throw new AuthorizationError('You do not have permission to view other users\' orders');
    }

    return this.orderRepository.findWithPagination(
      {
        userId: scopedUserId,
        status: filters.status,
        createdDate: filters.createdDate,
      },
      page,
      limit
    );
  }

  /**
   * Update the status of an existing order. Handles order lifecycle transitions.
   */
  public async updateOrderStatus(id: string, status: OrderStatus, updaterUserId: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    const previousStatus = order.status;

    // Validate transition
    if (!this.isValidTransition(previousStatus, status)) {
      logger.warn('Invalid order status transition attempt', {
        orderId: id,
        previousStatus,
        newStatus: status,
        performedBy: updaterUserId,
      });
      throw new ValidationError(`Invalid order status transition from ${previousStatus} to ${status}`);
    }

    logger.info('Transitioning Order status', {
      orderId: id,
      previousStatus,
      newStatus: status,
      performedBy: updaterUserId,
    });

    order.status = status;
    return this.orderRepository.save(order);
  }

  /**
   * Checks whether the status transition is valid according to CMart state machine rules.
   */
  private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    if (from === to) {
      return true;
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAID, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    return (allowedTransitions[from] || []).includes(to);
  }
}
