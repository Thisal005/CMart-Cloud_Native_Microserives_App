"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function FailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const reason = searchParams.get("reason") || "declined";

  // Map user-friendly messages based on backend codes or HTTP exception reasons
  const getExplanationMessage = (reasonStr: string) => {
    const lower = reasonStr.toLowerCase();
    if (lower.includes("declined") || lower.includes("card_decline")) {
      return "The transaction was declined by the card issuer. Please check your card balance, billing details, or use another card.";
    }
    if (lower.includes("timeout") || lower.includes("network")) {
      return "The connection to our payment gateway timed out. Your card was not charged. Please try again.";
    }
    if (lower.includes("duplicate")) {
      return "This payment appears to be a duplicate request. Please wait a moment and verify your transaction history before retrying.";
    }
    return `An error occurred while authorizing your transaction: "${reasonStr}". Your card was not billed.`;
  };

  return (
    <AuthenticatedLayout>
      <PublicLayout>
        <div className="bg-muted/20 flex min-h-screen items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md border shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-full">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
                Payment Declined
              </CardTitle>
              <CardDescription>Order Ref: {orderId.slice(0, 8).toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Details */}
              <div className="bg-destructive/5 border-destructive/10 space-y-2 rounded-lg border p-4 text-center">
                <p className="text-foreground text-sm leading-normal font-medium">
                  {getExplanationMessage(reason)}
                </p>
              </div>

              {orderId && (
                <div className="text-muted-foreground bg-muted/30 flex items-center justify-between rounded border p-2.5 text-xs font-semibold">
                  <span>Order Identifier:</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {orderId}
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/5 flex flex-col gap-2 border-t pt-4 sm:flex-row">
              <Button
                asChild
                variant="outline"
                className="order-2 w-full flex-1 gap-1.5 font-semibold sm:order-1 sm:w-auto"
              >
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4" /> Go to Shop
                </Link>
              </Button>
              <Button
                asChild
                className="order-1 w-full flex-1 gap-1.5 font-semibold sm:order-2 sm:w-auto"
              >
                <Link href={`/checkout/payment?orderId=${orderId}`}>
                  <RefreshCw className="h-4 w-4" /> Retry Payment
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PublicLayout>
    </AuthenticatedLayout>
  );
}
