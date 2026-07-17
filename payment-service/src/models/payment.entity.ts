import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { PaymentStatus, PaymentMethod } from './payment';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: false })
  orderId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: false })
  currency!: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_method_type',
    nullable: false,
  })
  paymentMethod!: PaymentMethod;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 255, nullable: false })
  transactionReference!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status_type',
    default: PaymentStatus.PENDING,
    nullable: false,
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: false })
  gateway!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      userId: this.userId,
      amount: Number(this.amount),
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      transactionReference: this.transactionReference,
      gateway: this.gateway,
      status: this.status,
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

    if (!this.userId) {
      throw new Error('User ID is required');
    }
    if (!uuidRegex.test(this.userId)) {
      throw new Error('User ID must be a valid UUID');
    }

    if (this.amount === undefined || this.amount === null) {
      throw new Error('Amount is required');
    }
    const amountNum = Number(this.amount);
    if (isNaN(amountNum) || amountNum < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    if (!this.currency || this.currency.trim().length !== 3) {
      throw new Error('Currency is required and must be a 3-character ISO code');
    }

    if (!this.transactionReference || this.transactionReference.trim().length === 0) {
      throw new Error('Transaction reference is required');
    }

    if (!this.gateway || this.gateway.trim().length === 0) {
      throw new Error('Gateway name is required');
    }

    if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
      throw new Error(`Invalid payment method: ${this.paymentMethod}`);
    }

    if (!Object.values(PaymentStatus).includes(this.status)) {
      throw new Error(`Invalid payment status: ${this.status}`);
    }
  }
}
