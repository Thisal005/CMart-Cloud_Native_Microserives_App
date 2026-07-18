"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorLayoutProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorLayout({ error, reset }: ErrorLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive mb-4 flex items-center justify-center rounded-full p-4">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        {error.message || "An unexpected rendering error occurred."}
      </p>
      {error.digest && (
        <code className="bg-muted text-muted-foreground mb-6 rounded px-2 py-1 text-xs">
          Digest ID: {error.digest}
        </code>
      )}
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
