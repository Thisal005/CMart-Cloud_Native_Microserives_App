"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center antialiased">
        <div className="bg-destructive/10 text-destructive mb-4 flex items-center justify-center rounded-full p-4">
          <AlertTriangle className="h-12 w-12" aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">System Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md text-sm">
          A critical system error occurred. We apologize for the inconvenience.
        </p>
        {error.message && (
          <pre className="bg-muted text-muted-foreground mb-6 max-w-lg overflow-auto rounded p-4 text-left font-mono text-xs">
            {error.message}
          </pre>
        )}
        <Button onClick={reset} variant="default" className="font-semibold">
          Reset Application
        </Button>
      </body>
    </html>
  );
}
