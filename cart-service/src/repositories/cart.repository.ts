import { Repository } from 'typeorm';
import { Cart } from '../models/cart.entity';
import { AppDataSource } from '../config/data-source';

export class CartRepository {
  private repository: Repository<Cart>;

  constructor() {
    this.repository = AppDataSource.getRepository(Cart);
  }

  /**
   * Find a cart by the associated User ID.
   * Loads related items eagerly as defined in relations or explicitly.
   */
  public async findByUserId(userId: string): Promise<Cart | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['items'],
    });
  }

  /**
   * Creates a new Cart instance (not saved to the DB yet).
   */
  public createInstance(data: Partial<Cart>): Cart {
    return this.repository.create(data);
  }

  /**
   * Creates and saves a new cart in a single operation.
   */
  public async create(data: Partial<Cart>): Promise<Cart> {
    const cart = this.createInstance(data);
    return this.repository.save(cart);
  }

  /**
   * Persists a Cart entity instance to the database.
   */
  public async save(cart: Cart): Promise<Cart> {
    return this.repository.save(cart);
  }

  /**
   * Updates an existing cart by merging partial data.
   */
  public async update(id: string, data: Partial<Cart>): Promise<Cart> {
    const cart = await this.repository.findOne({ where: { id } });
    if (!cart) {
      throw new Error(`Cart with ID ${id} not found`);
    }
    this.repository.merge(cart, data);
    return this.repository.save(cart);
  }

  /**
   * Hard deletes a cart by the associated User ID.
   */
  public async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
