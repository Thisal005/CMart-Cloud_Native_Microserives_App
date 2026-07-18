"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, Receipt, Calendar } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderDetailsQuery } from "@/features/orders/hooks/use-order-queries";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorState } from "@/components/ui/error-state";

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const { data: orderResponse, isLoading, isError, error, refetch } = useOrderDetailsQuery(orderId);

  const order = orderResponse?.data;
  const items = order?.items || [];
  const totalAmount = order?.totalAmount || 0;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse text-sm">
            Loading order confirmation receipt...
          </p>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !order) {
    return (
      <PublicLayout>
        <ErrorState
          title="Order Receipt Not Found"
          message={
            error instanceof Error ? error.message : "Please ensure the Order Service is active."
          }
          onRetry={refetch}
        />
      </PublicLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PublicLayout>
        <div className="mx-auto max-w-2xl space-y-8 py-4">
          {/* Success Checkmark */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="animate-pulse rounded-full bg-emerald-500/10 p-4 text-emerald-600">
              <CheckCircle className="h-12 w-12" aria-hidden="true" />
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground max-w-sm text-sm">
              Thank you for shopping at CMart. Your order has been registered and is pending
              shipment.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Reference ID:
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {order.id}
              </Badge>
            </div>
          </div>

          {/* Receipt Details Card */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="text-primary h-5 w-5" aria-hidden="true" /> Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <div className="space-y-3 p-6">
                <div className="text-muted-foreground flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Purchase Date:
                  </span>
                  <span className="text-foreground">{formatFullDate(order.createdAt)}</span>
                </div>
                <div className="text-muted-foreground flex justify-between text-xs font-medium">
                  <span>Order Status:</span>
                  <Badge
                    className={`border-none font-semibold ${
                      order.status === "PAID"
                        ? "bg-emerald-600 text-white"
                        : "animate-pulse bg-amber-600 text-white"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              {/* Items purchased */}
              <div className="space-y-4 p-6">
                <h4 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Purchased Items
                </h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">
                        {item.productName}{" "}
                        <span className="text-foreground text-xs font-semibold">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="text-foreground">{formatUSD(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-muted/5 flex items-center justify-between p-6">
                <span className="text-sm font-semibold">Total Charged</span>
                <span className="text-primary text-xl font-extrabold">
                  {formatUSD(totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Continue button */}
          <div className="flex justify-center">
            <Button asChild size="lg" className="gap-2 font-semibold">
              <Link href="/products">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    </AuthenticatedLayout>
  );
}
export type { ConfirmationContent as ConfirmationContentType };
