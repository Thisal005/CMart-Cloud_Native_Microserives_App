"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, CreditCard, ChevronRight, Loader2, MapPin, ClipboardCheck } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCartQuery } from "@/features/cart/hooks/use-cart-queries";
import { useCreateOrderMutation } from "@/features/orders/hooks/use-order-queries";
import { formatUSD } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { parseApiError } from "@/utils/error-parser";
import { toast } from "sonner";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 digits"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartResponse, isLoading: cartLoading } = useCartQuery();
  const createOrderMutation = useCreateOrderMutation();

  const [step, setStep] = React.useState<"shipping" | "review">("shipping");

  const cart = cartResponse?.data;
  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const shippingCost = totalAmount >= 100 ? 0 : 9.99;
  const grandTotal = totalAmount + shippingCost;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  const onShippingSubmit = () => {
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    const shipping = getValues();
    const shippingString = `${shipping.fullName}, ${shipping.address}, ${shipping.city}, ${shipping.postalCode}, ${shipping.country} (Phone: ${shipping.phone})`;

    try {
      const response = await createOrderMutation.mutateAsync({
        shippingAddress: shippingString,
      });
      if (response.data) {
        router.push(`/checkout/payment?orderId=${response.data.id}`);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || "Failed to create order");
    }
  };

  if (cartLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse text-sm">Loading checkout options...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <PublicLayout>
        <EmptyState
          title="Checkout is Empty"
          description="You cannot checkout without items in your shopping cart."
          actionLabel="Browse Products"
          onActionClick={() => router.push("/products")}
        />
      </PublicLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <PublicLayout>
        <div className="space-y-8 py-4">
          {/* Progress bar navigation */}
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Checkout</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
              <span className={step === "shipping" ? "text-primary" : ""}>Shipping</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className={step === "review" ? "text-primary" : ""}>Review Order</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Step panels wrapper */}
            <div className="space-y-6 lg:col-span-2">
              {step === "shipping" ? (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="text-primary h-5 w-5" aria-hidden="true" /> Shipping
                      Information
                    </CardTitle>
                  </CardHeader>
                  <form onSubmit={handleSubmit(onShippingSubmit)}>
                    <CardContent className="space-y-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-semibold tracking-tight">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Ava Patel"
                          className={
                            errors.fullName
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                          {...register("fullName")}
                        />
                        {errors.fullName && (
                          <p className="text-destructive text-xs font-semibold">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* Street address */}
                      <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-semibold tracking-tight">
                          Street Address
                        </label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="123 Main Street"
                          className={
                            errors.address
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                          {...register("address")}
                        />
                        {errors.address && (
                          <p className="text-destructive text-xs font-semibold">
                            {errors.address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* City */}
                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-semibold tracking-tight">
                            City
                          </label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="Seattle"
                            className={
                              errors.city ? "border-destructive focus-visible:ring-destructive" : ""
                            }
                            {...register("city")}
                          />
                          {errors.city && (
                            <p className="text-destructive text-xs font-semibold">
                              {errors.city.message}
                            </p>
                          )}
                        </div>

                        {/* Postal code */}
                        <div className="space-y-2">
                          <label
                            htmlFor="postalCode"
                            className="text-sm font-semibold tracking-tight"
                          >
                            Postal Code
                          </label>
                          <Input
                            id="postalCode"
                            type="text"
                            placeholder="98101"
                            className={
                              errors.postalCode
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                            {...register("postalCode")}
                          />
                          {errors.postalCode && (
                            <p className="text-destructive text-xs font-semibold">
                              {errors.postalCode.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Country */}
                        <div className="space-y-2">
                          <label htmlFor="country" className="text-sm font-semibold tracking-tight">
                            Country
                          </label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="United States"
                            className={
                              errors.country
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                            {...register("country")}
                          />
                          {errors.country && (
                            <p className="text-destructive text-xs font-semibold">
                              {errors.country.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-semibold tracking-tight">
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="206-555-0199"
                            className={
                              errors.phone
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                            {...register("phone")}
                          />
                          {errors.phone && (
                            <p className="text-destructive text-xs font-semibold">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/5 flex justify-end gap-2 border-t pt-4">
                      <Button variant="ghost" asChild>
                        <Link href="/cart">Return to Cart</Link>
                      </Button>
                      <Button type="submit" className="gap-2 font-semibold">
                        Review Order <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              ) : (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardCheck className="text-primary h-5 w-5" aria-hidden="true" /> Review
                      Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shipping Address summary review */}
                    <div className="bg-muted/30 space-y-2 rounded-lg border p-4">
                      <h4 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Shipping Address Details
                      </h4>
                      <p className="text-foreground text-sm font-semibold">
                        {getValues().fullName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {getValues().address}, {getValues().city}, {getValues().postalCode},{" "}
                        {getValues().country}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Phone Contact: {getValues().phone}
                      </p>
                    </div>

                    {/* Cart reviews */}
                    <div className="space-y-4">
                      <h4 className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Checkout Line Items
                      </h4>
                      <div className="bg-card divide-y rounded-lg border px-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between py-4">
                            <div>
                              <p className="text-sm font-semibold">{item.name}</p>
                              <span className="text-muted-foreground text-xs">
                                Quantity: {item.quantity} × {formatUSD(item.price)}
                              </span>
                            </div>
                            <span className="text-foreground self-center text-sm font-bold">
                              {formatUSD(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/5 flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => setStep("shipping")}>
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Details
                    </Button>
                    <Button
                      size="lg"
                      className="gap-2 font-semibold"
                      onClick={handlePlaceOrder}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order & Pay{" "}
                          <CreditCard className="ml-2 h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Right totals Column */}
            <div className="space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Billing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>Items Subtotal</span>
                    <span>{formatUSD(totalAmount)}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>Shipping Charges</span>
                    <span>{shippingCost === 0 ? "FREE" : formatUSD(shippingCost)}</span>
                  </div>
                  <hr className="border-muted" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Total Amount</span>
                    <span className="text-primary text-xl font-extrabold">
                      {formatUSD(grandTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PublicLayout>
    </AuthenticatedLayout>
  );
}
