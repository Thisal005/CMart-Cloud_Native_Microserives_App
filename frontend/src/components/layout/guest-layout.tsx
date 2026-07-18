"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export function GuestLayout({ children }: GuestLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground animate-pulse text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Avoid drawing guest page before redirection resolves
  }

  return <>{children}</>;
}
