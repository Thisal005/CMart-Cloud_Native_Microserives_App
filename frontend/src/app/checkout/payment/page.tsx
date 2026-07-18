import { Suspense } from "react";
import PaymentFormContent from "./payment-form-content";
import { LoadingLayout } from "@/components/layout/loading-layout";

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingLayout />}>
      <PaymentFormContent />
    </Suspense>
  );
}
