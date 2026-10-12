"use client";

import * as React from "react";
import Link from "next/link";
import { SpaceArt } from "@/components/ui/space-art";
import { Button } from "@/components/ui/button";

interface ErrorLayoutProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorLayout({ error, reset }: ErrorLayoutProps) {
  return (
    <div className="cosmic-shell flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <SpaceArt />
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
