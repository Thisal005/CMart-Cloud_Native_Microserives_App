export interface Transaction {
  transactionId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: Date;
}
