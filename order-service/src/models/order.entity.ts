import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status',
    default: OrderStatus.PENDING,
    nullable: false,
  })
  status!: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00, nullable: false })
  subtotal!: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2, default: 0.00, nullable: false })
  totalAmount!: number;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true, eager: true })
  items!: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      subtotal: Number(this.subtotal),
      totalAmount: Number(this.totalAmount),
      transactionId: this.transactionId,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // ── Validation Lifecycle Hooks ─────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  validate(): void {
    if (!this.userId) {
      throw new Error('User ID is required');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.userId)) {
      throw new Error('User ID must be a valid UUID');
    }

    if (this.subtotal === undefined || this.subtotal === null) {
      throw new Error('Subtotal is required');
    }
    const subtotalNum = Number(this.subtotal);
    if (isNaN(subtotalNum) || subtotalNum < 0) {
      throw new Error('Subtotal must be a non-negative number');
    }

    if (this.totalAmount === undefined || this.totalAmount === null) {
      throw new Error('Total amount is required');
    }
    const totalAmountNum = Number(this.totalAmount);
    if (isNaN(totalAmountNum) || totalAmountNum < 0) {
      throw new Error('Total amount must be a non-negative number');
    }

    if (!Object.values(OrderStatus).includes(this.status)) {
      throw new Error(`Invalid order status: ${this.status}`);
    }
  }
}
