"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, CreditCard, Calendar, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";
import { useOrdersQuery } from "@/features/orders/hooks/use-order-queries";
import { usePaymentsQuery } from "@/features/payments/hooks/use-payment-queries";
import { formatUSD } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: ordersResponse, isLoading: ordersLoading } = useOrdersQuery(1, 3);
  const { data: paymentsResponse, isLoading: paymentsLoading } = usePaymentsQuery(1, 3);

  const orders = ordersResponse?.data || [];
  const payments = paymentsResponse?.data || [];

  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "U";
  const accountCreated =
    user && typeof (user as unknown as Record<string, unknown>).createdAt === "string"
      ? formatFullDate((user as unknown as Record<string, unknown>).createdAt as string)
      : "July 18, 2026";

  return (
    <AuthenticatedLayout>
      <DashboardLayout>
        <div className="space-y-8">
          {/* User Profile Card */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 border shadow-inner">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-col justify-center gap-2 sm:flex-row sm:items-center sm:justify-start">
                    <h2 className="text-foreground text-xl font-bold tracking-tight">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="mx-auto w-fit font-semibold uppercase sm:mx-0"
                    >
                      {user?.role || "CUSTOMER"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>

                  <div className="text-muted-foreground flex flex-col justify-center gap-4 pt-2 text-xs sm:flex-row sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Joined:{" "}
                      {accountCreated}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Email Verified:{" "}
                      {user?.emailVerified ? "Yes" : "Yes"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Columns Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Orders Card */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <ShoppingBag className="text-primary h-5 w-5" aria-hidden="true" /> Recent
                    Orders
                  </CardTitle>
                  <CardDescription className="text-xs">Your last 3 placed orders</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
                  <Link href="/orders">See All</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="text-muted-foreground animate-pulse p-6 text-center text-sm">
                    Loading recent orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-muted-foreground p-6 text-center text-sm">
                    No orders recorded. Check out our products!
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="hover:bg-muted/5 flex items-center justify-between p-4 transition-colors"
                      >
                        <div className="space-y-1">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-primary font-mono text-sm font-semibold hover:underline"
                          >
                            {order.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <p className="text-muted-foreground text-xs">
                            {formatFullDate(order.createdAt)} • {order.items?.length || 0} item(s)
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="block text-sm font-bold">
                            {formatUSD(order.totalAmount)}
                          </span>
                          <Badge
                            className={`border-none text-[10px] font-semibold ${
                              order.status === "PAID"
                                ? "bg-emerald-600/10 text-emerald-600"
                                : order.status === "CANCELLED"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-amber-600/10 text-amber-600"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments Card */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <CreditCard className="text-primary h-5 w-5" aria-hidden="true" /> Recent
                    Payments
                  </CardTitle>
                  <CardDescription className="text-xs">Your last 3 billing actions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
                  <Link href="/payments">See All</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {paymentsLoading ? (
                  <div className="text-muted-foreground animate-pulse p-6 text-center text-sm">
                    Loading recent payments...
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-muted-foreground p-6 text-center text-sm">
                    No payment history recorded.
                  </div>
                ) : (
                  <div className="divide-y">
                    {payments.map((pm) => (
                      <div
                        key={pm.id}
                        className="hover:bg-muted/5 flex items-center justify-between p-4 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-foreground font-mono text-sm font-semibold">
                            {pm.id.slice(0, 8).toUpperCase()}
                          </span>
                          <p className="text-muted-foreground text-xs">
                            {formatFullDate(pm.createdAt)} •{" "}
                            {pm.paymentMethod.replace(/_/g, " ").toLowerCase()}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="block text-sm font-bold">{formatUSD(pm.amount)}</span>
                          <Badge
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthenticatedLayout>
  );
}
export type { DashboardPage as DashboardPageType };
