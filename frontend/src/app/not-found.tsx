import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 py-12 text-center">
        <div className="bg-primary/10 text-primary animate-bounce rounded-full p-4">
          <Search className="h-12 w-12" aria-hidden="true" />
        </div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground max-w-sm text-sm leading-normal">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="default" className="font-semibold">
            <Link href="/products">Browse Catalog</Link>
          </Button>
          <Button asChild variant="outline" className="font-semibold">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
