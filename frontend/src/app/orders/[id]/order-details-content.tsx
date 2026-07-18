"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Landmark,
  Truck,
  Wallet,
  ShieldAlert,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useOrderDetailsQuery } from "@/features/orders/hooks/use-order-queries";
import { useOrderPaymentsQuery } from "@/features/payments/hooks/use-payment-queries";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorState } from "@/components/ui/error-state";

interface OrderDetailsProps {
  id: string;
}

export default function OrderDetailsContent({ id }: OrderDetailsProps) {
  const {
    data: orderResponse,
    isLoading: orderLoading,
    isError: orderError,
    error: orderErr,
    refetch: refetchOrder,
  } = useOrderDetailsQuery(id);
  const { data: paymentsResponse, isLoading: paymentsLoading } = useOrderPaymentsQuery(id);

  const order = orderResponse?.data;
  const items = order?.items || [];
  const payments = paymentsResponse?.data || [];

  const isPaid =
    order?.status === "PAID" || order?.status === "PROCESSING" || order?.status === "COMPLETED";
  const isFailed = order?.status === "PAYMENT_FAILED";
  const isCancelled = order?.status === "CANCELLED";

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

  if (orderLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse text-sm">Loading order details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (orderError || !order) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Order Details Not Found"
          message={
            orderErr instanceof Error
              ? orderErr.message
              : "Please ensure the Order Service is active."
          }
          onRetry={refetchOrder}
        />
      </DashboardLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <Button
                variant="ghost"
                asChild
                className="mb-2 gap-2 pl-0 text-sm hover:bg-transparent"
              >
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Orders
                </Link>
              </Button>
              <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
                Order{" "}
                <span className="text-primary font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
              </h2>
              <p className="text-muted-foreground text-xs">
                Placed on {formatFullDate(order.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`border-none px-3 py-1 text-xs font-semibold ${
                isPaid
                  ? "bg-emerald-600 text-white"
                  : isFailed
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : isCancelled
                      ? "bg-muted text-muted-foreground"
                      : "animate-pulse bg-amber-600 text-white"
              }`}
            >
              {order.status}
            </Badge>
          </div>

          {/* Timeline steps */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <Clock className="text-primary h-4 w-4" aria-hidden="true" /> Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="bg-muted absolute top-[14px] right-[5%] left-[5%] z-0 hidden h-0.5 md:block" />

                {/* Step 1 */}
                <div className="bg-card z-10 flex items-center gap-3 pr-4 text-left md:flex-col md:gap-2 md:pr-0 md:text-center">
                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-1 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-bold">Order Placed</p>
                    <p className="text-muted-foreground text-[10px]">
                      {formatFullDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-card z-10 flex items-center gap-3 px-4 text-left md:flex-col md:gap-2 md:px-0 md:text-center">
                  <div
                    className={`rounded-full border p-1 ${
                      isPaid
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : isFailed
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "animate-pulse border-amber-500/20 bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isFailed ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-bold">Payment Status</p>
                    <p className="text-muted-foreground text-[10px]">
                      {isPaid ? "Paid" : isFailed ? "Payment Failed" : "Pending Payment"}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-card z-10 flex items-center gap-3 pl-4 text-left md:flex-col md:gap-2 md:pl-0 md:text-center">
                  <div
                    className={`rounded-full border p-1 ${
                      order.status === "COMPLETED"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground border-muted"
                    }`}
                  >
                    <Truck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-bold">Shipped & Delivered</p>
                    <p className="text-muted-foreground text-[10px]">
                      {order.status === "COMPLETED" ? "Delivered" : "Processing"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Product items list */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                    <ClipboardList className="text-primary h-4 w-4" aria-hidden="true" /> Line Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/10 border-b">
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-semibold">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatUSD(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-foreground text-right font-bold">
                            {formatUSD(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Payments transactions records */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                    <CreditCard className="text-primary h-4 w-4" aria-hidden="true" /> Payment
                    Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {paymentsLoading ? (
                    <div className="text-muted-foreground animate-pulse p-4 text-center text-xs">
                      Loading payment records...
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-muted-foreground p-4 text-center text-xs">
                      No payments logged for this order.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/10 border-b">
                        <TableRow>
                          <TableHead>Payment Reference</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Result Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((pm) => (
                          <TableRow key={pm.id}>
                            <TableCell className="font-mono text-xs">
                              {pm.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1.5 font-semibold">
                                {getMethodIcon(pm.paymentMethod)}
                                <span className="capitalize">
                                  {pm.paymentMethod.replace(/_/g, " ").toLowerCase()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-bold">
                              {formatUSD(pm.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className={`border-none text-[10px] font-semibold ${
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right details column */}
            <div className="space-y-6">
              {/* Order total card */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Summary Charges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Items Subtotal</span>
                    <span>{formatUSD(order.subtotal)}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Estimated Shipping</span>
                    <span>{order.totalAmount >= 100 ? "FREE" : "$9.99"}</span>
                  </div>
                  <hr className="border-muted" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Grand Total</span>
                    <span className="text-primary font-bold">{formatUSD(order.totalAmount)}</span>
                  </div>

                  {order.status === "PAYMENT_FAILED" && (
                    <Button asChild className="w-full pt-3 font-semibold" variant="destructive">
                      <Link href={`/checkout/payment?orderId=${order.id}`}>Retry Payment Now</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Shipping card details */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <h4 className="text-muted-foreground text-[9px] font-semibold tracking-wider uppercase">
                    Shipping Destination
                  </h4>
                  <p className="text-foreground leading-relaxed font-medium">
                    {order.shippingAddress || "No shipping address details found for this order."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthenticatedLayout>
  );
}
export type { OrderDetailsContent as OrderDetailsContentType };
