import { Repository } from 'typeorm';
import { OrderItem } from '../models/order-item.entity';
import { AppDataSource } from '../config/data-source';

export class OrderItemRepository {
  private repository: Repository<OrderItem>;

  constructor() {
    this.repository = AppDataSource.getRepository(OrderItem);
  }

  /**
   * Find a single order item by its unique ID.
   */
  public async findById(id: string): Promise<OrderItem | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['order'],
    });
  }

  /**
   * Find all order items belonging to a specific order ID.
   */
  public async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.repository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Instantiates a new OrderItem entity (not persisted to DB).
   */
  public createInstance(data: Partial<OrderItem>): OrderItem {
    return this.repository.create(data);
  }

  /**
   * Persists an OrderItem entity.
   */
  public async save(item: OrderItem): Promise<OrderItem> {
    return this.repository.save(item);
  }

  /**
   * Persists multiple OrderItem entities in a batch operation.
   */
  public async saveMultiple(items: OrderItem[]): Promise<OrderItem[]> {
    return this.repository.save(items);
  }

  /**
   * Creates and saves a new OrderItem.
   */
  public async create(data: Partial<OrderItem>): Promise<OrderItem> {
    const item = this.createInstance(data);
    return this.save(item);
  }

  /**
   * Deletes all items associated with an order ID.
   */
  public async deleteItemsByOrderId(orderId: string): Promise<boolean> {
    const result = await this.repository.delete({ orderId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Deletes a single order item by ID.
   */
  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
