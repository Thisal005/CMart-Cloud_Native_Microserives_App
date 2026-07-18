import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-card flex flex-col space-y-3 rounded-lg border p-4">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full rounded-md" />

      {/* Category Tag */}
      <Skeleton className="h-4 w-1/4 rounded" />

      {/* Title */}
      <Skeleton className="h-6 w-3/4 rounded" />

      {/* Description lines */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>

      {/* Price & Action Row */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-1/3 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Image block */}
      <Skeleton className="aspect-square w-full animate-pulse rounded-lg" />

      {/* Content panel */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-32 rounded" />
        <hr className="border-muted" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
export type { ProductGridSkeleton as ProductGridSkeletonType };
