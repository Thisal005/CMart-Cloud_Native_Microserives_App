import { apiClient } from "@/services/api-client";
import { StandardApiResponse } from "@/features/auth/services/auth-service";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  totalAmount: number;
  transactionId?: string;
  shippingAddress?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  notes?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<StandardApiResponse<Order>> {
    const response = await apiClient.post<StandardApiResponse<Order>>("/orders", payload);
    return response.data;
  },

  async getOrderById(id: string): Promise<StandardApiResponse<Order>> {
    const response = await apiClient.get<StandardApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  async getOrders(page = 1, limit = 10, status?: string): Promise<StandardApiResponse<Order[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.set("status", status);

    const response = await apiClient.get<StandardApiResponse<Order[]>>(
      `/orders?${params.toString()}`
    );
    return response.data;
  },
};
export type { StandardApiResponse };
