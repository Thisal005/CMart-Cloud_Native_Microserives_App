export interface OrderItemExternalDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderExternalDto {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  totalAmount: number;
  transactionId?: string;
  items: OrderItemExternalDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusRequestDto {
  status: string;
}
