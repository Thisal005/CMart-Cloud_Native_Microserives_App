import axios from 'axios';
import { config } from '../config';
import { Order, OrderStatus } from '../model/order';
import { OrderRepository } from '../repository/order.repository';
import { CreateOrderDto } from '../dto/order.dto';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return order;
  }

  public async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  public async createOrder(userId: string, token: string, dto: CreateOrderDto): Promise<Order> {
    const { paymentMethod, cardNumber } = dto;

    if (!paymentMethod || !cardNumber) {
      throw new Error('Payment method and card details are required');
    }

    // 1. Fetch the user's cart from the Cart Service
    let cart;
    try {
      const response = await axios.get(`${config.cartServiceUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cart = response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch cart: ${error.response?.data?.error || error.message}`);
    }

    if (!cart || cart.items.length === 0) {
      throw new Error('Cannot place an order with an empty cart');
    }

    // 2. Create the initial order in PENDING status
    const order = await this.orderRepository.create({
      userId,
      items: cart.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cart.totalAmount,
      status: OrderStatus.PENDING,
    });

    // 3. Request payment simulation from the Payment Service
    try {
      const paymentResponse = await axios.post(
        `${config.paymentServiceUrl}/api/payments`,
        {
          orderId: order.id,
          amount: order.totalAmount,
          paymentMethod,
          cardNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const paymentResult = paymentResponse.data;

      if (paymentResult.status === 'SUCCESS') {
        order.status = OrderStatus.PAID;
        order.transactionId = paymentResult.transactionId;

        // 4. Clear the cart since the order is paid
        try {
          await axios.delete(`${config.cartServiceUrl}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (clearCartError) {
          console.error(`Failed to clear cart for user ${userId} after payment:`, clearCartError);
          // Don't fail the order just because clearing cart failed, but log it.
        }
      } else {
        order.status = OrderStatus.FAILED;
      }
    } catch (paymentError: any) {
      console.error('Payment service call failed:', paymentError.response?.data || paymentError.message);
      order.status = OrderStatus.FAILED;
    }

    // 5. Update and return final order state
    await this.orderRepository.update(order);
    return order;
  }
}
