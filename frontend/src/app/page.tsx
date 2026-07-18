"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Laptop,
  Headphones,
  Keyboard,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductGridSkeleton } from "@/features/products/components/product-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function Home() {
  const { data: response, isLoading, isError, error, refetch } = useProductsQuery();

  const featuredProducts = response?.data?.slice(0, 3) || [];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="from-primary to-primary/80 text-primary-foreground relative mb-12 overflow-hidden rounded-3xl border bg-linear-to-r px-8 py-16 shadow-xl md:px-16 md:py-24">
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20 border-none px-3 py-1 text-xs font-semibold">
            Introducing CMart v2
          </Badge>
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Premium Tech Gear, Simplified.
          </h1>
          <p className="text-primary-foreground/90 text-lg font-medium">
            Explore our curated catalog of high-performance laptops, professional noise-cancelling
            headphones, and mechanical keyboards.
          </p>
          <div className="flex gap-4 pt-2">
            <Button size="lg" variant="secondary" asChild className="gap-2 font-semibold shadow-sm">
              <Link href="/products">
                Shop Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="from-primary-foreground/10 pointer-events-none absolute top-0 right-0 bottom-0 hidden w-1/3 bg-radial to-transparent md:block" />
      </section>

      {/* Category Shortcut Sections */}
      <section className="mb-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              name: "Computers",
              icon: Laptop,
              count: "Laptops & Desktops",
              color: "text-blue-500 bg-blue-500/10",
            },
            {
              name: "Audio",
              icon: Headphones,
              count: "Headphones & Speakers",
              color: "text-purple-500 bg-purple-500/10",
            },
            {
              name: "Accessories",
              icon: Keyboard,
              count: "Keyboards & Inputs",
              color: "text-amber-500 bg-amber-500/10",
            },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/products?category=${cat.name}`}
                className="group bg-card flex items-center gap-4 rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className={`rounded-lg p-3 ${cat.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{cat.name}</h3>
                  <p className="text-muted-foreground text-xs">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Lists */}
      <section className="mb-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground text-sm">
              Handpicked selections for developers and tech enthusiast builders
            </p>
          </div>
          <Button variant="ghost" asChild className="gap-1 text-sm font-semibold">
            <Link href="/products">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : isError ? (
          <ErrorState
            title="Failed to Load Products"
            message={
              error instanceof Error
                ? error.message
                : "Please ensure that the Product Service backend is running."
            }
            onRetry={refetch}
          />
        ) : featuredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <p className="text-muted-foreground mb-4 text-sm">No products found in the catalog</p>
            <Button size="sm" onClick={() => refetch()}>
              Reload
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Trust Blocks */}
      <section className="bg-muted/10 mb-8 grid grid-cols-1 gap-8 rounded-2xl border py-8 md:grid-cols-3">
        {[
          {
            icon: Truck,
            title: "Free Shipping",
            description: "On all catalog purchases above $100",
          },
          {
            icon: RotateCcw,
            title: "14-Day Returns",
            description: "Hassle-free money back guarantee policy",
          },
          {
            icon: ShieldCheck,
            title: "Secure Checkout",
            description: "Encrypted payments processed instantly",
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-4 px-6">
              <Icon className="text-primary/80 h-10 w-10 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
            </div>
          );
        })}
      </section>
    </PublicLayout>
  );
}
