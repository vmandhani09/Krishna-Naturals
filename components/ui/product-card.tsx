  "use client";

  import Image from "next/image";
  import Link from "next/link";
  import { useEffect, useState } from "react";
  import { Heart, ShoppingCart } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardFooter } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import type { Product } from "@/types";
  import { useWishlist } from "@/hooks/use-wishlist";

  interface ProductCardProps {
    product: Product;
  }

  export function ProductCard({ product }: ProductCardProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const handleWishlistToggle = () => {
      if (isInWishlist(String(product._id))) {
        removeFromWishlist(String(product._id));
      } else {
        addToWishlist(product)
      }
    };

    const selectedWeight =
      Array.isArray(product.weights) && product.weights.length > 0
        ? product.weights[0]
        : undefined;

    return (
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-stone-200 bg-white">
        <div className="relative overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name || "Product image"}
            width={300}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />

          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
              "opacity-0 group-hover:opacity-100 hover:scale-110",
              isInWishlist(String(product._id))
                ? "bg-red-500 text-white"
                : "bg-white text-stone-600 hover:bg-red-100 hover:text-red-500"
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("h-4 w-4", isInWishlist(String(product._id)) && "fill-current")} />
          </button>

          {Array.isArray(product.weights) &&
            product.weights.length > 0 &&
            product.weights[0].quantity < 20 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Low Stock
              </div>
            )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-stone-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="text-emerald-600 font-bold text-lg">
              {Array.isArray(product.weights) && product.weights.length > 0
                ? `₹${Math.min(...product.weights.map((w) => w.price))} - ₹${Math.max(
                    ...product.weights.map((w) => w.price)
                  )}`
                : "Price not available"}
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              {product.category}
            </span>
          </div>

        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Link href={`/product/${product.slug}`}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:shadow-lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Select Options
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
