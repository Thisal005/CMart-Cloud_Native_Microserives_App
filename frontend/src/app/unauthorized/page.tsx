"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive mb-4 flex animate-pulse items-center justify-center rounded-full p-4">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Access Restricted</h1>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        You do not have permission to access this page. If you believe this is an error, please
        contact systems support.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Return to Shop</Link>
        </Button>
      </div>
    </div>
  );
}
