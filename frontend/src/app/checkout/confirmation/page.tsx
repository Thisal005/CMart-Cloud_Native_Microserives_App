import { Suspense } from "react";
import ConfirmationContent from "./confirmation-content";
import { LoadingLayout } from "@/components/layout/loading-layout";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingLayout />}>
      <ConfirmationContent />
    </Suspense>
  );
}
