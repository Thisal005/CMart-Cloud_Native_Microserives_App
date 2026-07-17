export interface CreatePaymentRequestDto {
  orderId: string;
  paymentMethod: string;
  amount?: number;
  cardNumber?: string;
  currency?: string;
}

export interface CreatePaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  transactionReference: string;
}

export interface PaymentDetailsResponseDto {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  status: string;
  gateway: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundPaymentRequestDto {
  amount?: number;
}
