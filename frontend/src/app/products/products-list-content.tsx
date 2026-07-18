"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGridSkeleton } from "@/features/products/components/product-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Product } from "@/features/products/services/product-service";

const ITEMS_PER_PAGE = 6;
const EMPTY_PRODUCTS: Product[] = [];

export default function ProductsListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: response, isLoading, isError, error, refetch } = useProductsQuery();

  // Extract variables from search parameter state
  const querySearch = searchParams.get("searchTerm")?.toLowerCase() || "";
  const queryCategory = searchParams.get("category") || null;
  const queryMinPrice = parseFloat(searchParams.get("minPrice") || "") || null;
  const queryMaxPrice = parseFloat(searchParams.get("maxPrice") || "") || null;
  const queryInStock = searchParams.get("inStockOnly") === "true";
  const querySortBy = searchParams.get("sortBy") || "createdAt";
  const querySortOrder = searchParams.get("sortOrder") || "desc";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);

  const rawProducts = response?.data || EMPTY_PRODUCTS;

  // Generate unique categories dynamically from products catalog data
  const uniqueCategories = React.useMemo(() => {
    const cats = rawProducts.map((p) => p.category);
    return Array.from(new Set(cats)).filter(Boolean);
  }, [rawProducts]);

  // Apply filters, sorts and orders client side
  const filteredSortedData = React.useMemo(() => {
    let items = [...rawProducts];

    // Search query filter
    if (querySearch) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(querySearch) ||
          p.description.toLowerCase().includes(querySearch)
      );
    }

    // Category filter
    if (queryCategory) {
      items = items.filter((p) => p.category.toLowerCase() === queryCategory.toLowerCase());
    }

    // Price Bounds
    if (queryMinPrice !== null) {
      items = items.filter((p) => p.price >= queryMinPrice);
    }
    if (queryMaxPrice !== null) {
      items = items.filter((p) => p.price <= queryMaxPrice);
    }

    // Stock availability
    if (queryInStock) {
      items = items.filter((p) => p.stock > 0);
    }

    // Sort mappings
    items.sort((a, b) => {
      let comparison = 0;
      if (querySortBy === "price") {
        comparison = a.price - b.price;
      } else if (querySortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return querySortOrder === "asc" ? comparison : -comparison;
    });

    return items;
  }, [
    rawProducts,
    querySearch,
    queryCategory,
    queryMinPrice,
    queryMaxPrice,
    queryInStock,
    querySortBy,
    querySortOrder,
  ]);

  // Page split math
  const totalItems = filteredSortedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.max(1, Math.min(queryPage, totalPages));

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSortedData, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <PublicLayout>
      <div className="flex flex-col gap-8 py-4 md:flex-row">
        {/* Sidebar Filter Panel */}
        <aside className="bg-card h-fit w-full shrink-0 rounded-2xl border p-6 shadow-xs md:w-64">
          <ProductFilters categories={uniqueCategories} />
        </aside>

        {/* Grid List viewport */}
        <div className="flex-1 space-y-6">
          {isLoading ? (
            <ProductGridSkeleton count={ITEMS_PER_PAGE} />
          ) : isError ? (
            <ErrorState
              title="Failed to Load Products"
              message={
                error instanceof Error
                  ? error.message
                  : "Please ensure the Product Service backend is running."
              }
              onRetry={refetch}
            />
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="No catalog items matched your selected filters. Reset search terms or price sliders."
              actionLabel="Reset Catalog"
              onActionClick={() => router.push(pathname)}
            />
          ) : (
            <>
              {/* Product Card Grids */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginations links */}
              {totalPages > 1 && (
                <div className="flex justify-center border-t pt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pgNum = index + 1;
                        return (
                          <PaginationItem key={pgNum}>
                            <PaginationLink
                              href="#"
                              isActive={pgNum === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pgNum);
                              }}
                            >
                              {pgNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
export type { ProductsListContent as ProductsListContentType };
