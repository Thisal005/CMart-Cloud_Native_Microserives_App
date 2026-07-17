import { Repository } from 'typeorm';
import { CartItem } from '../models/cart-item.entity';
import { AppDataSource } from '../config/data-source';

export class CartItemRepository {
  private repository: Repository<CartItem>;

  constructor() {
    this.repository = AppDataSource.getRepository(CartItem);
  }

  /**
   * Find all items associated with a given cart ID.
   */
  public async findItemsByCartId(cartId: string): Promise<CartItem[]> {
    return this.repository.find({
      where: { cartId },
    });
  }

  /**
   * Instantiates a new CartItem object (not saved to database).
   */
  public createInstance(data: Partial<CartItem>): CartItem {
    return this.repository.create(data);
  }

  /**
   * Adds/Creates and persists a new item.
   */
  public async create(data: Partial<CartItem>): Promise<CartItem> {
    const item = this.createInstance(data);
    return this.repository.save(item);
  }

  /**
   * Persists an existing CartItem instance to the database.
   */
  public async save(item: CartItem): Promise<CartItem> {
    return this.repository.save(item);
  }

  /**
   * Removes/Deletes a cart item by its primary key ID.
   */
  public async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Updates the quantity of a specific cart item by ID.
   */
  public async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) {
      throw new Error(`Cart item with ID ${id} not found`);
    }
    item.quantity = quantity;
    return this.repository.save(item);
  }

  /**
   * Deletes all items belonging to a specific cart ID.
   */
  public async deleteItemsByCartId(cartId: string): Promise<boolean> {
    const result = await this.repository.delete({ cartId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Find a cart item by its ID, eager loading the parent cart.
   */
  public async findById(id: string): Promise<CartItem | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['cart'],
    });
  }
}
