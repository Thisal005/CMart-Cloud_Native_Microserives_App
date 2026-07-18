import { apiClient } from "@/services/api-client";
import { StandardApiResponse } from "@/features/auth/services/auth-service";

export interface PaymentResult {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "DIGITAL_WALLET";
  transactionReference: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
  gateway: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "DIGITAL_WALLET";
  amount: number;
  cardNumber?: string;
}

export const paymentService = {
  async processPayment(payload: CreatePaymentPayload): Promise<StandardApiResponse<PaymentResult>> {
    const response = await apiClient.post<StandardApiResponse<PaymentResult>>("/payments", payload);
    return response.data;
  },

  async getPaymentById(id: string): Promise<StandardApiResponse<PaymentResult>> {
    const response = await apiClient.get<StandardApiResponse<PaymentResult>>(`/payments/${id}`);
    return response.data;
  },

  async getPaymentHistoryByOrderId(orderId: string): Promise<StandardApiResponse<PaymentResult[]>> {
    const response = await apiClient.get<StandardApiResponse<PaymentResult[]>>(
      `/payments/order/${orderId}`
    );
    return response.data;
  },

  async getPayments(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<StandardApiResponse<PaymentResult[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.set("status", status);

    const response = await apiClient.get<StandardApiResponse<PaymentResult[]>>(
      `/payments?${params.toString()}`
    );
    return response.data;
  },
};
export type { StandardApiResponse };
