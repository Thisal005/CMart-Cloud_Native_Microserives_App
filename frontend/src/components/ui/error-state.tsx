import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try Again",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="bg-destructive/10 text-destructive mb-4 flex items-center justify-center rounded-full p-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-destructive mb-2 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
