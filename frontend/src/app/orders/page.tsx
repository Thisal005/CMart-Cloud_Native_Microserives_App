"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useOrdersQuery } from "@/features/orders/hooks/use-order-queries";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function OrderHistoryPage() {
  const { data: response, isLoading, isError, error, refetch } = useOrdersQuery(1, 20);

  const orders = response?.data || [];

  return (
    <AuthenticatedLayout>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-xl font-bold tracking-tight">My Orders</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground animate-pulse text-sm">Loading orders list...</p>
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to Load Orders"
              message={
                error instanceof Error
                  ? error.message
                  : "Please ensure the Order Service is running."
              }
              onRetry={refetch}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No Orders Found"
              description="You have not placed any orders yet. Add some items to your cart and checkout!"
              actionLabel="Start Shopping"
              onActionClick={() => {
                window.location.href = "/products";
              }}
            />
          ) : (
            <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="text-primary font-mono text-xs font-semibold">
                        <Link href={`/orders/${order.id}`} className="hover:underline">
                          {order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatFullDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {order.items?.length || 0} item(s)
                      </TableCell>
                      <TableCell className="text-foreground font-bold">
                        {formatUSD(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-none font-semibold ${
                            order.status === "PAID"
                              ? "bg-emerald-600/10 text-emerald-600"
                              : order.status === "CANCELLED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-amber-600/10 text-amber-600"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-primary text-xs font-semibold"
                          >
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthenticatedLayout>
  );
}
export type { OrderHistoryPage as OrderHistoryPageType };
