import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoadingLayout() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground animate-pulse text-sm">Loading content...</p>
      </div>
    </div>
  );
}
