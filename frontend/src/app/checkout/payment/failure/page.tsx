import { Suspense } from "react";
import FailureContent from "./failure-content";
import { LoadingLayout } from "@/components/layout/loading-layout";

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<LoadingLayout />}>
      <FailureContent />
    </Suspense>
  );
}
