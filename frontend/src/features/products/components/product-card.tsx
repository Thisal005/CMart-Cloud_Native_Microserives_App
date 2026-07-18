import Image from "next/image";
import Link from "next/link";
import { Product } from "@/features/products/services/product-service";
import { formatUSD } from "@/utils/currency";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="bg-muted relative block aspect-square overflow-hidden"
        aria-label={`View details for ${product.name}`}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Availability Badge */}
        <Badge
          className={`absolute top-3 left-3 border-none font-semibold ${
            isOutOfStock
              ? "bg-destructive text-destructive-foreground"
              : "bg-emerald-600 text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </Badge>
      </Link>

      <CardHeader className="space-y-1 p-4 pb-2">
        {/* Category */}
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {product.category}
        </span>
        {/* Name */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="hover:text-primary line-clamp-1 text-base font-semibold tracking-tight transition-colors">
            {product.name}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0 pb-4">
        {/* Description */}
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {product.description || "No description available for this item."}
        </p>
      </CardContent>

      <CardFooter className="bg-muted/10 flex items-center justify-between border-t p-4">
        <span className="text-foreground text-lg font-bold tracking-tight">
          {formatUSD(product.price)}
        </span>
        <Button size="sm" asChild disabled={isOutOfStock}>
          <Link href={`/products/${product.id}`}>
            {isOutOfStock ? "Unavailable" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
export type { ProductCardProps };
