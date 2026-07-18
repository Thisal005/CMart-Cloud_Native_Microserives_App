import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProductsQuery } from "@/features/products/hooks/use-products";

// Create custom wrapper for TanStack query bindings
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryWrapper";
  return Wrapper;
}

describe("useProductsQuery TanStack Hook", () => {
  it("queries the product list successfully from mock API backend", async () => {
    const { result } = renderHook(() => useProductsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const products = result.current.data?.data || [];
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe("Mock Laptop");
    expect(products[1].name).toBe("Mock Headphones");
  });
});
export type { createWrapper as createWrapperType };
