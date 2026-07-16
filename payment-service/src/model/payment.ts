// ============================================================
// CMart Payment Service — Models & Enums Definitions
// ============================================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export enum PaymentGateway {
  MOCK = 'MOCK',
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export interface PaymentModel {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: PaymentStatus;
  gateway: string;
  createdAt: Date;
  updatedAt: Date;
}
