import axios from 'axios';
import { config } from '../config';
import { Cart, CartItem } from '../model/cart';
import { CartRepository } from '../repository/cart.repository';
import { AddToCartDto } from '../dto/cart.dto';

export class CartService {
  private cartRepository: CartRepository;

  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  public async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = {
        userId,
        items: [],
        totalAmount: 0,
      };
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  public async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = dto;

    if (!productId || quantity <= 0) {
      throw new Error('Valid productId and quantity greater than 0 are required');
    }

    // Call Product Service to fetch details
    let product;
    try {
      const response = await axios.get(`${config.productServiceUrl}/api/products/${productId}`);
      product = response.data;
    } catch (error: any) {
      throw new Error(`Product check failed: ${error.response?.data?.error || 'Product not found'}`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    const cart = await this.getCart(userId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // Check total quantity against stock
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error(`Insufficient stock. Total requested quantity (${newQuantity}) exceeds stock (${product.stock})`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      // Keep price updated from the product service
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    this.recalculateTotal(cart);
    return this.cartRepository.save(cart);
  }

  public async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const index = cart.items.findIndex(item => item.productId === productId);

    if (index === -1) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    cart.items.splice(index, 1);
    this.recalculateTotal(cart);
    return this.cartRepository.save(cart);
  }

  public async clearCart(userId: string): Promise<void> {
    await this.cartRepository.deleteByUserId(userId);
  }

  private recalculateTotal(cart: Cart) {
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.totalAmount = parseFloat(total.toFixed(2));
  }
}
