"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import { JourneyBanner } from "@/components/layout/journey-banner";
import { useUIStore } from "@/store/use-ui-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, clearSession } = useAuthStore();
  const { cartBadgeCount } = useCartStore();

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/products", icon: ShoppingBag },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
    { label: "Orders", href: "/orders", icon: ShoppingCart },
    { label: "Payments", href: "/payments", icon: CreditCard },
  ];

  const userInitials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "U";

  const handleLogout = () => {
    clearSession();
    queryClient.clear();
    router.push("/login");
  };

  return (
    <div className="cosmic-shell dashboard-shell text-foreground flex min-h-screen">
      {/* Sidebar Panel */}
      <aside
        className={`dashboard-sidebar bg-card border-border sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r duration-300 ${
          sidebarOpen ? "w-64 max-md:w-16" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold tracking-tight ${
              sidebarOpen ? "opacity-100 max-md:hidden" : "w-0 overflow-hidden opacity-0"
            }`}
          >
            <span>CMart.</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
            aria-label="Toggle account navigation"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    sidebarOpen ? "opacity-100 max-md:hidden" : "w-0 overflow-hidden opacity-0"
                  }`}
                >
                  {item.label}
                </span>
                {item.label === "Cart" && cartBadgeCount > 0 && sidebarOpen && (
                  <Badge
                    variant="secondary"
                    className="ml-auto text-[10px] font-bold max-md:hidden"
                  >
                    {cartBadgeCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            aria-label="Log out"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3 px-3 py-2 text-sm"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={
                sidebarOpen ? "opacity-100 max-md:hidden" : "w-0 overflow-hidden opacity-0"
              }
            >
              Logout
            </span>
          </Button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="bg-card/70 border-border flex h-20 items-center justify-between border-b px-4 backdrop-blur-xl md:px-8">
          <p className="text-lg font-semibold capitalize">
            {navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
              ?.label || "My account"}
          </p>
          <div className="flex items-center gap-4">
            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && user && (
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-xs font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-muted-foreground text-[10px] capitalize">{user.role}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <main className="account-content flex-1 p-4 md:p-8">
          <JourneyBanner />
          {children}
        </main>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to end your session and log out of CMart?"
        confirmLabel="Logout"
        isDestructive
      />
    </div>
  );
}
