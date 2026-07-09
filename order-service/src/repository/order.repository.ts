import { Order } from '../model/order';
import crypto from 'crypto';

export class OrderRepository {
  private orders: Order[] = [];

  public async findById(id: string): Promise<Order | undefined> {
    return this.orders.find((o) => o.id === id);
  }

  public async findByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  public async create(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      ...orderData,
      createdAt: new Date(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  public async update(order: Order): Promise<Order> {
    const index = this.orders.findIndex((o) => o.id === order.id);
    if (index > -1) {
      this.orders[index] = order;
    }
    return order;
  }
}
