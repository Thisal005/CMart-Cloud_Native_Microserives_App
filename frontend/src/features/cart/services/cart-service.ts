import { apiClient } from "@/services/api-client";
import { StandardApiResponse } from "@/features/auth/services/auth-service";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RawCartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface RawCart {
  id: string;
  userId: string;
  items: RawCartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Maps unique static image URLs based on seed product catalog names
export function mapCartItemImage(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("laptop")) {
    return "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=200";
  } else if (nameLower.includes("headphone")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200";
  } else if (nameLower.includes("keyboard")) {
    return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=200";
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200";
}

export function mapCartItem(item: RawCartItem): CartItem {
  return {
    ...item,
    imageUrl: mapCartItemImage(item.name),
  };
}

export const cartService = {
  async getCart(): Promise<StandardApiResponse<Cart>> {
    const response = await apiClient.get<StandardApiResponse<RawCart>>("/cart");
    const cart = response.data.data;
    const mappedItems = (cart.items || []).map(mapCartItem);

    return {
      ...response.data,
      data: {
        ...cart,
        items: mappedItems,
      },
    };
  },

  async addToCart(productId: string, quantity: number): Promise<StandardApiResponse<Cart>> {
    const response = await apiClient.post<StandardApiResponse<RawCart>>("/cart/items", {
      productId,
      quantity,
    });
    const cart = response.data.data;
    const mappedItems = (cart.items || []).map(mapCartItem);

    return {
      ...response.data,
      data: {
        ...cart,
        items: mappedItems,
      },
    };
  },

  async updateQuantity(itemId: string, quantity: number): Promise<StandardApiResponse<Cart>> {
    const response = await apiClient.put<StandardApiResponse<RawCart>>(`/cart/items/${itemId}`, {
      quantity,
    });
    const cart = response.data.data;
    const mappedItems = (cart.items || []).map(mapCartItem);

    return {
      ...response.data,
      data: {
        ...cart,
        items: mappedItems,
      },
    };
  },

  async removeFromCart(itemId: string): Promise<StandardApiResponse<Cart>> {
    const response = await apiClient.delete<StandardApiResponse<RawCart>>(`/cart/items/${itemId}`);
    const cart = response.data.data;
    const mappedItems = (cart.items || []).map(mapCartItem);

    return {
      ...response.data,
      data: {
        ...cart,
        items: mappedItems,
      },
    };
  },

  async clearCart(): Promise<StandardApiResponse<null>> {
    const response = await apiClient.delete<StandardApiResponse<null>>("/cart");
    return response.data;
  },
};
export type { StandardApiResponse };
