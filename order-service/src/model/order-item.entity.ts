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
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: false })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 255, nullable: false })
  productName!: string;

  @Column({ type: 'integer', nullable: false })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2, nullable: false })
  unitPrice!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false })
  subtotal!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      unitPrice: Number(this.unitPrice),
      subtotal: Number(this.subtotal),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // ── Validation Lifecycle Hooks ─────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  validate(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!this.orderId) {
      throw new Error('Order ID is required');
    }
    if (!uuidRegex.test(this.orderId)) {
      throw new Error('Order ID must be a valid UUID');
    }

    if (!this.productId) {
      throw new Error('Product ID is required');
    }
    if (!uuidRegex.test(this.productId)) {
      throw new Error('Product ID must be a valid UUID');
    }

    if (!this.productName || this.productName.trim().length === 0) {
      throw new Error('Product name is required');
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
    const unitPriceNum = Number(this.unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum < 0) {
      throw new Error('Unit price must be a non-negative number');
    }

    if (this.subtotal === undefined || this.subtotal === null) {
      throw new Error('Subtotal is required');
    }
    const subtotalNum = Number(this.subtotal);
    if (isNaN(subtotalNum) || subtotalNum < 0) {
      throw new Error('Subtotal must be a non-negative number');
    }
  }
}
