"use client";

import Link from "next/link";
import { SpaceArt } from "@/components/ui/space-art";
import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <div className="cosmic-shell flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <SpaceArt />
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
