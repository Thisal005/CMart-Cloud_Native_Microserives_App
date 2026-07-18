"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  Loader2,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Landmark,
  Wallet,
  Truck,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useOrderDetailsQuery } from "@/features/orders/hooks/use-order-queries";
import { useProcessPaymentMutation } from "@/features/payments/hooks/use-payment-queries";
import { formatUSD } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorState } from "@/components/ui/error-state";
import { parseApiError } from "@/utils/error-parser";

const paymentSchema = z
  .object({
    paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH_ON_DELIVERY", "DIGITAL_WALLET"]),
    cardNumber: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "CARD") {
        const cleanCard = (data.cardNumber || "").replace(/\s+/g, "");
        return cleanCard.length >= 16;
      }
      return true;
    },
    {
      message: "Card number must be at least 16 digits",
      path: ["cardNumber"],
    }
  );

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const {
    data: orderResponse,
    isLoading: orderLoading,
    isError: orderError,
    error,
    refetch,
  } = useOrderDetailsQuery(orderId);
  const processPaymentMutation = useProcessMutation();

  const order = orderResponse?.data;
  const totalAmount = order?.totalAmount || 0;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "CARD",
      cardNumber: "",
    },
  });

  const selectedMethod = watch("paymentMethod");

  const onSubmit = async (values: PaymentFormValues) => {
    if (!orderId) return;
    try {
      const cleanCardNumber =
        values.paymentMethod === "CARD" ? values.cardNumber?.replace(/\s+/g, "") : undefined;
      const res = await processPaymentMutation.mutateAsync({
        orderId,
        paymentMethod: values.paymentMethod,
        amount: totalAmount,
        cardNumber: cleanCardNumber,
      });

      if (res.data && res.data.status === "SUCCESS") {
        router.push(`/checkout/confirmation?orderId=${orderId}`);
      } else {
        router.push(`/checkout/payment/failure?orderId=${orderId}&reason=declined`);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      router.push(
        `/checkout/payment/failure?orderId=${orderId}&reason=${encodeURIComponent(parsed.message || "network_timeout")}`
      );
    }
  };

  // Helper component to custom instantiates mutations (wraps the hook to allow clean redirects on throw)
  function useProcessMutation() {
    return useProcessPaymentMutation();
  }

  if (orderLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse text-sm">
            Initializing secure payment channel...
          </p>
        </div>
      </PublicLayout>
    );
  }

  if (orderError || !order) {
    return (
      <PublicLayout>
        <ErrorState
          title="Order Not Found"
          message={
            error instanceof Error ? error.message : "Please ensure the Order Service is active."
          }
          onRetry={refetch}
        />
      </PublicLayout>
    );
  }

  if (order.status === "PAID") {
    return (
      <PublicLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-600">
            <ShieldCheck className="h-12 w-12" aria-hidden="true" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">Order Already Paid</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            This order has already been processed and paid for. You can view your invoice details.
          </p>
          <Button asChild>
            <Link href={`/checkout/confirmation?orderId=${orderId}`}>View Order Confirmation</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PublicLayout>
        <div className="bg-muted/20 flex min-h-screen items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md border shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <CreditCard className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
                Secure Checkout
              </CardTitle>
              <CardDescription>Order Ref: {orderId.slice(0, 8).toUpperCase()}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Total amount banner */}
                <div className="bg-primary/5 flex items-center justify-between rounded-lg border p-4">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Amount Due
                  </span>
                  <span className="text-primary text-xl font-extrabold">
                    {formatUSD(totalAmount)}
                  </span>
                </div>

                {/* Method selector */}
                <div className="space-y-2">
                  <label htmlFor="payment-method" className="text-sm font-semibold tracking-tight">
                    Payment Method
                  </label>
                  <select
                    id="payment-method"
                    className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                    {...register("paymentMethod")}
                  >
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                    <option value="DIGITAL_WALLET">Digital Wallet (PayPal / Venmo)</option>
                  </select>
                </div>

                {/* CARD details */}
                {selectedMethod === "CARD" && (
                  <div className="animate-in fade-in space-y-2 duration-200">
                    <label htmlFor="card-number" className="text-sm font-semibold tracking-tight">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="text-muted-foreground absolute top-3 left-3 h-4 w-4"
                        aria-hidden="true"
                      />
                      <Input
                        id="card-number"
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        className={`pl-9 ${errors.cardNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("cardNumber")}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-destructive text-xs font-semibold">
                        {errors.cardNumber.message}
                      </p>
                    )}
                  </div>
                )}

                {/* BANK_TRANSFER details */}
                {selectedMethod === "BANK_TRANSFER" && (
                  <div className="bg-muted/40 animate-in fade-in space-y-2 rounded-md border p-4 duration-200">
                    <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Landmark className="text-primary h-4 w-4" aria-hidden="true" /> Bank Wire
                      Instructions
                    </h4>
                    <p className="text-muted-foreground text-xs leading-normal">
                      Wire your total amount directly to our corporate accounts. Note your Reference
                      ID in the transfer comments.
                    </p>
                  </div>
                )}

                {/* CASH_ON_DELIVERY details */}
                {selectedMethod === "CASH_ON_DELIVERY" && (
                  <div className="bg-muted/40 animate-in fade-in space-y-2 rounded-md border p-4 duration-200">
                    <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Truck className="text-primary h-4 w-4" aria-hidden="true" /> Cash on Delivery
                      Instructions
                    </h4>
                    <p className="text-muted-foreground text-xs leading-normal">
                      Prepare the exact payment total for our delivery driver upon dropoff. Cheques
                      are not accepted.
                    </p>
                  </div>
                )}

                {/* DIGITAL_WALLET details */}
                {selectedMethod === "DIGITAL_WALLET" && (
                  <div className="bg-muted/40 animate-in fade-in space-y-2 rounded-md border p-4 duration-200">
                    <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Wallet className="text-primary h-4 w-4" aria-hidden="true" /> Digital Wallet
                      Details
                    </h4>
                    <p className="text-muted-foreground text-xs leading-normal">
                      You will be prompted to authorize details securely with PayPal or Venmo
                      integrations in the next step.
                    </p>
                  </div>
                )}

                <div className="text-muted-foreground bg-muted/40 flex items-start gap-2 rounded border p-2.5 text-[10px]">
                  <AlertCircle
                    className="text-primary mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Your secure connection is encrypted. Financial actions are audited by mock
                    gateway providers.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full gap-2 font-semibold"
                  disabled={processPaymentMutation.isPending}
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Processing Secure Gateway...
                    </>
                  ) : (
                    <>
                      Authorize Payment <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </PublicLayout>
    </AuthenticatedLayout>
  );
}
