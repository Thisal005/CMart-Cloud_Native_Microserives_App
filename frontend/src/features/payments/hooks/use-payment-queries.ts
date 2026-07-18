import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentService, CreatePaymentPayload } from "@/features/payments/services/payment-service";
import { parseApiError } from "@/utils/error-parser";

export function useProcessPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentService.processPayment(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ["order", response.data.orderId] });
        queryClient.invalidateQueries({ queryKey: ["order-payments", response.data.orderId] });
      }
      toast.success(response.message || "Payment processed successfully!");
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      toast.error(parsed.message || "Payment processing failed");
    },
  });
}

export function usePaymentDetailsQuery(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentService.getPaymentById(paymentId),
    enabled: !!paymentId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrderPaymentsQuery(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["order-payments", orderId],
    queryFn: () => paymentService.getPaymentHistoryByOrderId(orderId),
    enabled: !!orderId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentsQuery(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: ["payments", page, limit, status],
    queryFn: () => paymentService.getPayments(page, limit, status),
    staleTime: 1 * 60 * 1000,
  });
}
