import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/product-service";

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
    staleTime: 10 * 60 * 1000, // Cache product lists for 10 minutes
  });
}

export function useProductDetailsQuery(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    staleTime: 10 * 60 * 1000, // Cache product details for 10 minutes
    enabled: !!id,
  });
}
