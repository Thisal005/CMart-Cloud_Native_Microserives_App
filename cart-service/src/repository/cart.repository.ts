import { Cart } from '../model/cart';

export class CartRepository {
  private carts: Map<string, Cart> = new Map();

  public async findByUserId(userId: string): Promise<Cart | undefined> {
    return this.carts.get(userId);
  }

  public async save(cart: Cart): Promise<Cart> {
    this.carts.set(cart.userId, cart);
    return cart;
  }

  public async deleteByUserId(userId: string): Promise<void> {
    this.carts.delete(userId);
  }
}
