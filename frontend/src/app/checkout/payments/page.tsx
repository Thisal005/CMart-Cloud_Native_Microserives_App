"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Landmark, Truck, Wallet } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
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
import { usePaymentsQuery } from "@/features/payments/hooks/use-payment-queries";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function PaymentsHistoryPage() {
  const { data: response, isLoading, isError, error, refetch } = usePaymentsQuery(1, 20);

  const payments = response?.data || [];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CARD":
        return <CreditCard className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />;
      case "BANK_TRANSFER":
        return <Landmark className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />;
      case "DIGITAL_WALLET":
        return <Wallet className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />;
      default:
        return <Truck className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <AuthenticatedLayout>
      <PublicLayout>
        <div className="space-y-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Payment History</h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Shop
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground animate-pulse text-sm">
                Loading transaction history...
              </p>
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to Load History"
              message={
                error instanceof Error
                  ? error.message
                  : "Please ensure the Payment Service is running."
              }
              onRetry={refetch}
            />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No Payments Logged"
              description="You have not completed any payments yet. Browse our catalog and checkout items!"
              actionLabel="Shop Now"
              onActionClick={() => {
                window.location.href = "/products";
              }}
            />
          ) : (
            <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((pm) => (
                    <TableRow key={pm.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono text-xs">
                        {pm.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatFullDate(pm.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {pm.orderId.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5 font-semibold">
                          {getMethodIcon(pm.paymentMethod)}
                          <span className="capitalize">
                            {pm.paymentMethod.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-bold">
                        {formatUSD(pm.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`border-none font-semibold ${
                            pm.status === "SUCCESS"
                              ? "bg-emerald-600/10 text-emerald-600"
                              : pm.status === "FAILED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-amber-600/10 text-amber-600"
                          }`}
                        >
                          {pm.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </PublicLayout>
    </AuthenticatedLayout>
  );
}
export type { PaymentsHistoryPage as PaymentsHistoryPageType };
