"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useCartStore } from "@/store/use-cart-store";
import { useCartQuery } from "@/features/cart/hooks/use-cart-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, clearSession } = useAuthStore();
  const { cartBadgeCount, toggleCart } = useCartStore();

  // Load and subscribe the query pipeline to automatically synchronize card counts
  useCartQuery();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Navbar Header */}
      <header className="bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
          >
            CMart
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/products"
              className="hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </Link>

            {/* Cart Trigger Badge */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="hover:text-primary relative flex items-center gap-1.5 px-2"
              aria-label="Toggle Shopping Cart drawer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartBadgeCount > 0 && (
                <Badge className="bg-primary text-primary-foreground border-background absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-bold">
                  {cartBadgeCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <span className="text-muted-foreground hidden text-xs md:inline">
                  Hi, {user?.firstName}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:text-destructive text-muted-foreground flex items-center gap-1 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-primary text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hover:text-primary text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* View Content Wrapper */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-muted-foreground text-xs font-medium">
            © {new Date().getFullYear()} CMart Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-muted-foreground text-xs hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-foreground text-xs hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
export type { PublicLayoutProps };
