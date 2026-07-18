"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { parseApiError } from "@/utils/error-parser";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Support silencing global errors for queries using meta config options
            if (query.meta?.silent) return;
            const parsed = parseApiError(error);
            toast.error(parsed.message);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.silent) return;
            const parsed = parseApiError(error);
            toast.error(parsed.message);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              if (failureCount >= 2) return false;

              // Safe check on unknown error
              const err = error as Record<string, unknown> | null;
              const status =
                err?.status ?? (err?.response as Record<string, unknown> | null)?.status;

              if (typeof status === "number" && [400, 401, 403, 404, 422].includes(status)) {
                return false;
              }

              return true;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
