"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, Trash } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCartQuery,
  useUpdateQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "@/features/cart/hooks/use-cart-queries";
import { formatUSD } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function CartPage() {
  const { data: response, isLoading, isError, error, refetch } = useCartQuery();
  const updateQuantityMutation = useUpdateQuantityMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const clearCartMutation = useClearCartMutation();

  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);

  const cart = response?.data;
  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty <= 0) return;
    try {
      await updateQuantityMutation.mutateAsync({ itemId, quantity: nextQty });
    } catch {
      // Handled inside the mutations query catch hooks
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId);
    } catch {
      // Handled inside the mutations query catch hooks
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
    } catch {
      // Handled inside the mutations query catch hooks
    } finally {
      setIsClearConfirmOpen(false);
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-8 py-4">
        {/* Navigation header row */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 pl-0 text-sm hover:bg-transparent">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </Button>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2 text-xs"
              onClick={() => setIsClearConfirmOpen(true)}
            >
              <Trash className="h-4 w-4" aria-hidden="true" /> Clear Cart
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground animate-pulse text-sm">Loading your cart...</p>
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to Load Cart"
            message={
              error instanceof Error ? error.message : "Please ensure the Cart Service is running."
            }
            onRetry={refetch}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your Shopping Cart is Empty"
            description="Add some high-performance items from our product catalog to get started!"
            actionLabel="Browse Products"
            onActionClick={() => {
              window.location.href = "/products";
            }}
          />
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Left table column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight">
                  Shopping Cart ({totalItems} items)
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                    >
                      {/* Product details */}
                      <div className="flex gap-4">
                        <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="line-clamp-1 text-sm font-semibold">{item.name}</h4>
                          <span className="text-muted-foreground block text-xs">
                            Unit Price: {formatUSD(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity modifiers & Price subtotal calculation */}
                      <div className="flex w-full items-center justify-between gap-8 sm:w-auto sm:justify-end">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={updateQuantityMutation.isPending}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="min-w-[80px] text-right">
                          <span className="block text-sm font-bold">
                            {formatUSD(item.price * item.quantity)}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeFromCartMutation.isPending}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary column */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>Total items</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>Shipping fee</span>
                    <span>{totalAmount >= 100 ? "FREE" : "$9.99"}</span>
                  </div>
                  {totalAmount < 100 && (
                    <div className="rounded-md bg-amber-500/10 p-2.5 text-xs font-medium text-amber-600">
                      Add <span className="font-bold">{formatUSD(100 - totalAmount)}</span> more to
                      qualify for Free Shipping!
                    </div>
                  )}
                  <hr className="border-muted" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Subtotal</span>
                    <span className="text-xl font-bold">{formatUSD(totalAmount)}</span>
                  </div>

                  <Button size="lg" className="w-full pt-3 font-semibold" disabled>
                    Proceed to Checkout
                  </Button>
                  <p className="text-muted-foreground mt-2 text-center text-[10px]">
                    Checkout integration is disabled (Cart module only).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog overlay */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearCart}
        title="Empty Shopping Cart"
        description="Are you sure you want to delete all items from your shopping cart? This action is permanent."
        confirmLabel="Clear Cart"
        isDestructive
      />
    </PublicLayout>
  );
}
