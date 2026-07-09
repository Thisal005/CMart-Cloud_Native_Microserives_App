export interface PaymentRequestDto {
  orderId: string;
  amount: number;
  paymentMethod: string;
  cardNumber: string;
}

export interface PaymentResponseDto {
  transactionId: string;
  orderId: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  createdAt: Date;
}
