import { Repository } from 'typeorm';
import { Order } from '../model/order.entity';
import { OrderStatus } from '../model/order';
import { AppDataSource } from '../config/data-source';

export class OrderRepository {
  private repository: Repository<Order>;

  constructor() {
    this.repository = AppDataSource.getRepository(Order);
  }

  /**
   * Find an order by its unique ID.
   */
  public async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  /**
   * Find all orders belonging to a specific User ID.
   */
  public async findByUserId(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Instantiates a new Order entity (not persisted to DB).
   */
  public createInstance(data: Partial<Order>): Order {
    return this.repository.create(data);
  }

  /**
   * Persists a new or existing Order entity.
   */
  public async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  /**
   * Creates and saves an order from raw data.
   */
  public async create(data: Partial<Order>): Promise<Order> {
    const order = this.createInstance(data);
    return this.save(order);
  }

  /**
   * Updates order status.
   */
  public async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    order.status = status;
    return this.save(order);
  }

  /**
   * Merges updates into an existing order and saves.
   */
  public async update(id: string, data: Partial<Order>): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    this.repository.merge(order, data);
    return this.save(order);
  }

  /**
   * Deletes an order by ID.
   */
  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Counts the total number of orders based on filters.
   */
  public async count(filters?: { userId?: string; status?: OrderStatus }): Promise<number> {
    return this.repository.count({ where: filters });
  }

  /**
   * Query orders with support for user_id, status, created_at range, and pagination.
   */
  public async findWithPagination(
    filters: {
      userId?: string;
      status?: OrderStatus;
      createdDate?: Date;
    },
    page = 1,
    limit = 10
  ): Promise<{ data: Order[]; total: number }> {
    const query = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item');

    if (filters.userId) {
      query.andWhere('order.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters.createdDate) {
      const startOfDay = new Date(filters.createdDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.createdDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    query.orderBy('order.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
