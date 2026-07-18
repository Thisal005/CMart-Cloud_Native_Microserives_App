"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import {
  useCartQuery,
  useUpdateQuantityMutation,
  useRemoveFromCartMutation,
} from "@/features/cart/hooks/use-cart-queries";
import { formatUSD } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function MiniCartDrawer() {
  const { isOpen, setCartOpen } = useCartStore();
  const { data: response, isLoading } = useCartQuery();
  const updateQuantityMutation = useUpdateQuantityMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();

  const cart = response?.data;
  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  // Close drawer on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setCartOpen]);

  // Lock scrolling when active
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty <= 0) return;
    try {
      await updateQuantityMutation.mutateAsync({ itemId, quantity: nextQty });
    } catch {
      // Error notifications are handled inside the mutation hooks
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId);
    } catch {
      // Error notifications are handled inside the mutation hooks
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop Backdrop Overlay */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/60 transition-opacity duration-200"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Main Body */}
      <div className="bg-card animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-md flex-col border-l shadow-2xl transition-transform duration-300">
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-bold tracking-tight">Shopping Cart</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Dynamic Items Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground animate-pulse text-sm">Loading cart items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="bg-muted rounded-full p-4">
                <ShoppingBag className="text-muted-foreground h-10 w-10" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">Your Cart is Empty</h3>
              <p className="text-muted-foreground max-w-[220px] text-xs">
                Add some high-performance items from our catalog to get started!
              </p>
              <Button size="sm" onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  {/* Photo box */}
                  <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Detail text */}
                  <div className="flex-1 space-y-1">
                    <h4 className="line-clamp-1 text-sm font-semibold tracking-tight">
                      {item.name}
                    </h4>
                    <span className="text-foreground text-xs font-bold">
                      {formatUSD(item.price)}
                    </span>

                    {/* Quantity bounds toggles */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={updateQuantityMutation.isPending}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.id)}
                    disabled={removeFromCartMutation.isPending}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0 self-center"
                    aria-label={`Remove ${item.name} from shopping cart`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subtotals & Routing Actions */}
        {items.length > 0 && (
          <div className="bg-muted/10 space-y-4 border-t p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-semibold">Subtotal</span>
              <span className="text-foreground text-lg font-extrabold">
                {formatUSD(totalAmount)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full font-semibold" onClick={() => setCartOpen(false)}>
                <Link href="/cart">View Cart Page</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export type { MiniCartDrawer as MiniCartDrawerType };
