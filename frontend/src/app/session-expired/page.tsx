"use client";

import Link from "next/link";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex animate-pulse items-center justify-center rounded-full bg-yellow-500/10 p-4 text-yellow-600">
        <Hourglass className="h-12 w-12" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Session Expired</h1>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Your login session has expired for security. Please sign in again to re-authenticate.
      </p>
      <Button asChild variant="default" className="w-full max-w-[200px]">
        <Link href="/login">Sign In</Link>
      </Button>
    </div>
  );
}
