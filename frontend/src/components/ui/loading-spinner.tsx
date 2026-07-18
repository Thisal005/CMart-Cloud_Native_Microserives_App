import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div
      className={cn(
        "border-primary/30 border-r-primary border-b-primary border-l-primary animate-spin rounded-full border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
}
