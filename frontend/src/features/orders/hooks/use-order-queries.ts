import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService, CreateOrderPayload } from "@/features/orders/services/order-service";
import { parseApiError } from "@/utils/error-parser";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: (response) => {
      // Cart is cleared after ordering, so invalidate query caches
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(response.message || "Order created successfully!");
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      toast.error(parsed.message || "Failed to place order");
    },
  });
}

export function useOrderDetailsQuery(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrdersQuery(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: ["orders", page, limit, status],
    queryFn: () => orderService.getOrders(page, limit, status),
    staleTime: 1 * 60 * 1000,
  });
}
