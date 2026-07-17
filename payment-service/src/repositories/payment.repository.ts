import { Repository } from 'typeorm';
import { Payment } from '../models/payment.entity';
import { PaymentStatus, PaymentMethod } from '../models/payment';
import { AppDataSource } from '../config/data-source';

export class PaymentRepository {
  private repository: Repository<Payment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Payment);
  }

  /**
   * Instantiates a new Payment entity instance (not saved to DB yet).
   */
  public createInstance(data: Partial<Payment>): Payment {
    return this.repository.create(data);
  }

  /**
   * Saves a payment record (either new or existing).
   */
  public async save(payment: Payment): Promise<Payment> {
    return this.repository.save(payment);
  }

  /**
   * Creates and persists a new Payment record.
   */
  public async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.createInstance(data);
    return this.save(payment);
  }

  /**
   * Find payment by ID.
   */
  public async findById(id: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Find payment by unique gateway transaction reference.
   */
  public async findByTransactionReference(transactionReference: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { transactionReference } });
  }

  /**
   * Find all payments belonging to a specific User ID.
   */
  public async findByUserId(userId: string): Promise<Payment[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all payments belonging to a specific Order ID.
   */
  public async findByOrderId(orderId: string): Promise<Payment[]> {
    return this.repository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Updates payment status.
   */
  public async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.findById(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    payment.status = status;
    return this.save(payment);
  }

  /**
   * Updates payment gateway transaction reference.
   */
  public async updateTransactionReference(id: string, transactionReference: string): Promise<Payment> {
    const payment = await this.findById(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    payment.transactionReference = transactionReference;
    return this.save(payment);
  }

  /**
   * Counts payment records matching filters.
   */
  public async count(filters?: {
    userId?: string;
    orderId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    gateway?: string;
  }): Promise<number> {
    return this.repository.count({ where: filters });
  }

  /**
   * Fetch paginated payments with optional filtering and custom sorting.
   */
  public async findWithPagination(
    filters: {
      userId?: string;
      orderId?: string;
      status?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      gateway?: string;
      createdDate?: Date;
    },
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{ data: Payment[]; total: number }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'DESC';

    const query = this.repository.createQueryBuilder('payment');

    if (filters.userId) {
      query.andWhere('payment.userId = :userId', { userId: filters.userId });
    }

    if (filters.orderId) {
      query.andWhere('payment.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters.gateway) {
      query.andWhere('payment.gateway = :gateway', { gateway: filters.gateway });
    }

    if (filters.createdDate) {
      const startOfDay = new Date(filters.createdDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.createdDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    // Sort column validation to protect against SQL injection on dynamic ordering
    const allowedSortFields = ['createdAt', 'amount', 'status', 'updatedAt'];
    const actualSortField = allowedSortFields.includes(sortBy) ? `payment.${sortBy}` : 'payment.createdAt';

    query.orderBy(actualSortField, sortOrder);

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
