"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  categories: string[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load initial states from URL parameters
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("searchTerm") || "");
  const [minPrice, setMinPrice] = React.useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("maxPrice") || "");
  const [inStockOnly, setInStockOnly] = React.useState(searchParams.get("inStockOnly") === "true");
  const [sortBy, setSortBy] = React.useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = React.useState(searchParams.get("sortOrder") || "desc");

  // Sync state with URL modifications
  const updateFilters = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1"); // Reset pagination on filter trigger

      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Debounced input search listeners
  React.useEffect(() => {
    const delay = setTimeout(() => {
      const current = searchParams.get("searchTerm") || "";
      if (searchTerm !== current) {
        updateFilters({ searchTerm });
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, updateFilters, searchParams]);

  const handleCategorySelect = (category: string | null) => {
    updateFilters({ category });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
  };

  const handleInStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setInStockOnly(val);
    updateFilters({ inStockOnly: val ? "true" : null });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let newSortBy = "createdAt";
    let newSortOrder = "desc";

    if (val === "price_asc") {
      newSortBy = "price";
      newSortOrder = "asc";
    } else if (val === "price_desc") {
      newSortBy = "price";
      newSortOrder = "desc";
    } else if (val === "name_asc") {
      newSortBy = "name";
      newSortOrder = "asc";
    } else if (val === "name_desc") {
      newSortBy = "name";
      newSortOrder = "desc";
    }

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push(pathname);
  };

  const selectedCategory = searchParams.get("category");
  const activeSortVal = `${sortBy}_${sortOrder}`;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-2">
        <label htmlFor="search-input" className="text-sm font-semibold tracking-tight">
          Search Products
        </label>
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-3 left-3 h-4 w-4"
            aria-hidden="true"
          />
          <Input
            id="search-input"
            type="text"
            placeholder="Search catalog..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold tracking-tight">Categories</h4>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-start md:gap-1">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            onClick={() => handleCategorySelect(null)}
            className="justify-start text-xs md:w-full"
          >
            All Products
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "ghost"}
              size="sm"
              onClick={() => handleCategorySelect(cat)}
              className="justify-start text-xs md:w-full"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Sorting Preset */}
      <div className="space-y-2">
        <label htmlFor="sort-select" className="text-sm font-semibold tracking-tight">
          Sort Catalog
        </label>
        <select
          id="sort-select"
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
          value={activeSortVal}
          onChange={handleSortChange}
        >
          <option value="createdAt_desc">Newest Listings</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>

      {/* Price Bounds Form */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold tracking-tight">Price Bounds</h4>
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-8 text-xs"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Min pricing limit"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-8 text-xs"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Max pricing limit"
          />
          <Button type="submit" size="sm" className="h-8 px-3 text-xs">
            Filter
          </Button>
        </form>
      </div>

      {/* Availability Toggle */}
      <div className="border-muted flex items-center space-x-2 border-t pt-2">
        <input
          id="stock-toggle"
          type="checkbox"
          checked={inStockOnly}
          onChange={handleInStockToggle}
          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="stock-toggle" className="cursor-pointer text-sm leading-none font-medium">
          In Stock Only
        </label>
      </div>

      {/* Clear Filters Actions */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs"
        onClick={clearAllFilters}
      >
        <X className="h-3 w-3" />
        Clear Filters
      </Button>
    </div>
  );
}
export type { ProductFiltersProps };
