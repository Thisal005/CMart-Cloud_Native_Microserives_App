"use client";

import * as React from "react";
import Link from "next/link";
import { SpaceHeader } from "@/components/home/space-header";
import { JourneyBanner } from "@/components/layout/journey-banner";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="cosmic-shell flex min-h-screen flex-col">
      <SpaceHeader />
      <main className="cosmic-container flex-1 py-8 md:py-12">
        <JourneyBanner />
        {children}
      </main>
      <footer className="cosmic-footer">
        <div className="cosmic-container flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            CMart<span className="text-primary">.</span>
          </Link>
          <p className="text-muted-foreground text-xs">
            A universe of possibilities. One destination.
          </p>
          <Link href="/products" className="text-primary text-sm">
            Explore the collection ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}
export type { PublicLayoutProps };
