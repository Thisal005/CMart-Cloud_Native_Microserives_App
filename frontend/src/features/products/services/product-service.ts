import { apiClient } from "@/services/api-client";
import { StandardApiResponse } from "@/features/auth/services/auth-service";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  imageUrl: string;
  category: string;
  sku: string;
  isActive: boolean;
}

export interface RawProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
}

export function mapProductDetails(product: RawProduct): Product {
  const id = product.id;
  // Fallback defaults
  let imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800";
  let category = "Electronics";
  let sku = "EL-PROD-" + id.slice(0, 6).toUpperCase();

  const nameLower = product.name.toLowerCase();
  if (nameLower.includes("laptop")) {
    imageUrl = "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=800";
    category = "Computers";
    sku = "CO-LAPT-" + id.slice(0, 6).toUpperCase();
  } else if (nameLower.includes("headphone")) {
    imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800";
    category = "Audio";
    sku = "AU-HEAD-" + id.slice(0, 6).toUpperCase();
  } else if (nameLower.includes("keyboard")) {
    imageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800";
    category = "Accessories";
    sku = "AC-KEYB-" + id.slice(0, 6).toUpperCase();
  }

  return {
    ...product,
    imageUrl,
    category,
    sku,
    isActive: true,
  };
}

export const productService = {
  async getProducts(): Promise<StandardApiResponse<Product[]>> {
    const response = await apiClient.get<StandardApiResponse<RawProduct[]>>("/products");
    const mappedData = response.data.data.map(mapProductDetails);
    return {
      ...response.data,
      data: mappedData,
    };
  },

  async getProductById(id: string): Promise<StandardApiResponse<Product>> {
    const response = await apiClient.get<StandardApiResponse<RawProduct>>(`/products/${id}`);
    return {
      ...response.data,
      data: mapProductDetails(response.data.data),
    };
  },
};
export type { StandardApiResponse };
