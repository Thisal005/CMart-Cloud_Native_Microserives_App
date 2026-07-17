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
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true, nullable: false })
  userId!: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true, eager: true })
  items!: CartItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  get totalAmount(): number {
    if (!this.items) return 0;
    const total = this.items.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0);
    return parseFloat(total.toFixed(2));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
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
  }
}
