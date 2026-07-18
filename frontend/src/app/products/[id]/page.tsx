"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Calendar, Clipboard } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductDetailsQuery, useProductsQuery } from "@/features/products/hooks/use-products";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductDetailsSkeleton } from "@/features/products/components/product-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";
import { Product } from "@/features/products/services/product-service";
import { useAddToCartMutation } from "@/features/cart/hooks/use-cart-queries";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const EMPTY_PRODUCTS: Product[] = [];

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCartMutation();

  // Load details and catalog lists for related products queries
  const {
    data: detailResponse,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailErr,
    refetch: refetchDetail,
  } = useProductDetailsQuery(id);
  const { data: listResponse, isLoading: listLoading } = useProductsQuery();

  const product = detailResponse?.data;
  const rawProducts = listResponse?.data || EMPTY_PRODUCTS;

  // Related products: filter products matching the same category, excluding active ID
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return rawProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, rawProducts]);

  const isLoading = detailsLoading || listLoading;
  const isOutOfStock = product ? product.stock <= 0 : true;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      router.push("/login");
      return;
    }
    if (!product) return;
    try {
      await addToCartMutation.mutateAsync({ productId: product.id, quantity: 1 });
    } catch {
      // Error is caught by React Query hook internally
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-8 py-4">
        {/* Back link */}
        <Button variant="ghost" asChild className="gap-2 pl-0 text-sm hover:bg-transparent">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </Button>

        {isLoading ? (
          <ProductDetailsSkeleton />
        ) : detailsError || !product ? (
          <ErrorState
            title="Failed to Load Product Details"
            message={
              detailErr instanceof Error
                ? detailErr.message
                : "Please check that the Product Service backend is active."
            }
            onRetry={refetchDetail}
          />
        ) : (
          <div className="space-y-16">
            {/* Primary Detail Section */}
            <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
              {/* Product Photo Grid Frame */}
              <div className="bg-card relative aspect-square overflow-hidden rounded-2xl border shadow-xs">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Product Info Block */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-primary text-xs font-semibold uppercase">
                    {product.category}
                  </Badge>
                  <h1 className="text-foreground text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
                    {product.name}
                  </h1>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Clipboard className="h-3.5 w-3.5" aria-hidden="true" /> SKU:{" "}
                      <span className="text-foreground font-semibold">{product.sku}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Listed:{" "}
                      <span className="text-foreground font-semibold">
                        {formatFullDate(product.createdAt)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-foreground block text-3xl font-extrabold tracking-tight">
                    {formatUSD(product.price)}
                  </span>
                  <div>
                    <Badge
                      className={`border-none font-semibold ${
                        isOutOfStock
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} remaining)`}
                    </Badge>
                  </div>
                </div>

                <hr className="border-muted" />

                <div className="space-y-2">
                  <h3 className="text-muted-foreground text-sm font-semibold tracking-tight uppercase">
                    Description
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description || "No description available for this item."}
                  </p>
                </div>

                {/* Shopping Actions (Cart functionality) */}
                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="w-full gap-2 font-semibold sm:w-auto"
                    disabled={isOutOfStock || addToCartMutation.isPending}
                    onClick={handleAddToCart}
                  >
                    {addToCartMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Related recommendations */}
            {relatedProducts.length > 0 && (
              <div className="space-y-6 border-t pt-12">
                <div>
                  <h2 className="text-foreground text-xl font-bold tracking-tight">
                    Related Products
                  </h2>
                  <p className="text-muted-foreground text-xs font-medium">
                    Explore similar catalog listings in {product.category}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedProducts.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
