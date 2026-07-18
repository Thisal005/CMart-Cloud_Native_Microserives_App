import * as React from "react";
import { Suspense } from "react";
import OrderDetailsContent from "./order-details-content";
import { LoadingLayout } from "@/components/layout/loading-layout";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = React.use(params);

  return (
    <Suspense fallback={<LoadingLayout />}>
      <OrderDetailsContent id={id} />
    </Suspense>
  );
}
export type { OrderDetailsPageProps };
