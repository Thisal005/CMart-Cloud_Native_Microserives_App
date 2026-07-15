import { OrderStatus } from '../model/order';

/**
 * Request DTO for creating an order from the user's cart.
 * The body is optional — the cart is fetched from the Cart Service.
 */
export interface CreateOrderDto {
  shippingAddress?: string;
  notes?: string;
}

/**
 * Request DTO for updating the status of an existing order.
 */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

/**
 * Query DTO for listing orders with pagination and optional filters.
 */
export interface GetOrdersQueryDto {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Response DTO representing an individual order item snapshot.
 */
export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response DTO representing a full order with its line items.
 */
export interface OrderResponseDto {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  totalAmount: number;
  items: OrderItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}
