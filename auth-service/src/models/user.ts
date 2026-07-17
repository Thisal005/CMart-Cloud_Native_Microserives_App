import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

// ── Enums ──────────────────────────────────────────────────

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// ── Entity ─────────────────────────────────────────────────

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false })
  passwordHash!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber!: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'user_role',
    default: Role.USER,
    nullable: false,
  })
  role!: Role;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    enumName: 'account_status',
    default: AccountStatus.ACTIVE,
    nullable: false,
  })
  status!: AccountStatus;

  @Column({ name: 'email_verified', type: 'boolean', default: false, nullable: false })
  emailVerified!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  // ── Validation Lifecycle Hooks ─────────────────────────────

  @BeforeInsert()
  @BeforeUpdate()
  validate(): void {
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }
    if (this.firstName.length > 100) {
      throw new Error('First name cannot exceed 100 characters');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }
    if (this.lastName.length > 100) {
      throw new Error('Last name cannot exceed 100 characters');
    }

    if (!this.email || this.email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }
    if (this.email.length > 255) {
      throw new Error('Email cannot exceed 255 characters');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.passwordHash || this.passwordHash.trim().length === 0) {
      throw new Error('Password hash cannot be empty');
    }
    if (this.passwordHash.length > 255) {
      throw new Error('Password hash cannot exceed 255 characters');
    }

    if (this.phoneNumber !== undefined && this.phoneNumber !== null) {
      if (this.phoneNumber.trim().length === 0) {
        this.phoneNumber = null;
      } else {
        if (this.phoneNumber.length > 20) {
          throw new Error('Phone number cannot exceed 20 characters');
        }
        const simplePhoneRegex = /^\+?[0-9\s\-()]+$/;
        if (!simplePhoneRegex.test(this.phoneNumber)) {
          throw new Error('Invalid phone number format');
        }
      }
    }

    if (this.role && !Object.values(Role).includes(this.role)) {
      throw new Error('Invalid user role');
    }

    if (this.status && !Object.values(AccountStatus).includes(this.status)) {
      throw new Error('Invalid account status');
    }
  }
}

