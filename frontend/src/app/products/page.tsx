import { Suspense } from "react";
import ProductsListContent from "./products-list-content";
import { LoadingLayout } from "@/components/layout/loading-layout";

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingLayout />}>
      <ProductsListContent />
    </Suspense>
  );
}
