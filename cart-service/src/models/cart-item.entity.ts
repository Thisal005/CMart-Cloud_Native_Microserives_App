import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'cart_id', type: 'uuid', nullable: false })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ type: 'integer', default: 1, nullable: false })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2, nullable: false })
  unitPrice!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Transient fields populated dynamically at runtime (not persisted in DB)
  name?: string;

  get price(): number {
    return Number(this.unitPrice);
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // ── Validation Lifecycle Hooks ─────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  validate(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!this.cartId) {
      throw new Error('Cart ID is required');
    }
    if (!uuidRegex.test(this.cartId)) {
      throw new Error('Cart ID must be a valid UUID');
    }

    if (!this.productId) {
      throw new Error('Product ID is required');
    }
    if (!uuidRegex.test(this.productId)) {
      throw new Error('Product ID must be a valid UUID');
    }

    if (this.quantity === undefined || this.quantity === null) {
      throw new Error('Quantity is required');
    }
    if (!Number.isInteger(this.quantity) || this.quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    if (this.unitPrice === undefined || this.unitPrice === null) {
      throw new Error('Unit price is required');
    }
    const priceNum = Number(this.unitPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      throw new Error('Unit price must be a non-negative number');
    }
  }
}
