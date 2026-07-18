import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { cartService, Cart, StandardApiResponse } from "@/features/cart/services/cart-service";
import { useCartStore } from "@/store/use-cart-store";
import { useAuthStore } from "@/store/use-auth-store";

export function useCartQuery() {
  const { isAuthenticated } = useAuthStore();
  const { setCartBadgeCount } = useCartStore();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
  });

  const totalQuantity = React.useMemo(() => {
    if (!query.data?.data?.items) return 0;
    return query.data.data.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [query.data?.data?.items]);

  React.useEffect(() => {
    if (query.data?.success) {
      setCartBadgeCount(totalQuantity);
    } else if (!isAuthenticated) {
      setCartBadgeCount(0);
    }
  }, [totalQuantity, query.data?.success, isAuthenticated, setCartBadgeCount]);

  return query;
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const { setCartBadgeCount } = useCartStore();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.addToCart(productId, quantity),
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response);
      const totalQuantity = response.data?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartBadgeCount(totalQuantity);
      toast.success("Item added to cart");
    },
    onError: () => {
      toast.error("Failed to add item to cart");
    },
  });
}

export function useUpdateQuantityMutation() {
  const queryClient = useQueryClient();
  const { setCartBadgeCount } = useCartStore();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<StandardApiResponse<Cart>>(["cart"]);

      if (previousCart && previousCart.data) {
        const updatedItems = previousCart.data.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity };
          }
          return item;
        });

        const totalAmount = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);

        queryClient.setQueryData<StandardApiResponse<Cart>>(["cart"], {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
            totalAmount,
          },
        });

        setCartBadgeCount(totalQuantity);
      }

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        const totalQuantity =
          context.previousCart.data?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartBadgeCount(totalQuantity);
      }
      toast.error("Failed to update item quantity");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();
  const { setCartBadgeCount } = useCartStore();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<StandardApiResponse<Cart>>(["cart"]);

      if (previousCart && previousCart.data) {
        const updatedItems = previousCart.data.items.filter((item) => item.id !== itemId);
        const totalAmount = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalQuantity = updatedItems.reduce((acc, item) => acc + item.quantity, 0);

        queryClient.setQueryData<StandardApiResponse<Cart>>(["cart"], {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
            totalAmount,
          },
        });

        setCartBadgeCount(totalQuantity);
      }

      return { previousCart };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
        const totalQuantity =
          context.previousCart.data?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartBadgeCount(totalQuantity);
      }
      toast.error("Failed to remove item from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();
  const { setCartBadgeCount } = useCartStore();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(["cart"], {
        success: true,
        message: "Cart cleared successfully",
        data: {
          id: "",
          userId: "",
          items: [],
          totalAmount: 0,
          createdAt: "",
          updatedAt: "",
        },
      });
      setCartBadgeCount(0);
      toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });
}
