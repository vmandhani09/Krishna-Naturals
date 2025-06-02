"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void | Promise<void>;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  const selectedWeight =
    Array.isArray(product.weights) && product.weights.length > 0
      ? product.weights[0]
      : undefined;

  // Check login status and wishlist state
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    setIsLoggedIn(!!token);

    if (token) {
      fetch("/api/user/wishlist", {
        method: "GET",
        headers: { "user-id": token },
      })
        .then((res) => res.json())
        .then((data) => {
          const wishlist = data?.wishlist ?? [];
          setIsInWishlistState(wishlist.includes(product.sku));
        })
        .catch((err) => console.error("Error checking user wishlist:", err));
    } else {
      const guestWishlistRaw = localStorage.getItem("guestWishlist");
      const guestWishlist: Product[] = guestWishlistRaw ? JSON.parse(guestWishlistRaw) : [];
      const isInGuestWishlist = guestWishlist.some((item) => item.sku === product.sku);
      setIsInWishlistState(isInGuestWishlist);
    }
  }, [product.sku]);

  const toggleWishlist = async () => {
    try {
      if (isLoggedIn) {
        const response = await fetch("/api/user/wishlist", {
          method: isInWishlistState ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: product.sku }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Error updating wishlist");

        setIsInWishlistState(!isInWishlistState);
      } else {
        const guestWishlistRaw = localStorage.getItem("guestWishlist");
        const guestWishlist: Product[] = guestWishlistRaw ? JSON.parse(guestWishlistRaw) : [];

        let updated: Product[] = [];

        if (isInWishlistState) {
          updated = guestWishlist.filter((item) => item.sku !== product.sku);
        } else {
          updated = [...guestWishlist, product];
        }

        localStorage.setItem("guestWishlist", JSON.stringify(updated));
        setIsInWishlistState(!isInWishlistState);
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-stone-200 bg-white">
      <div className="relative overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
           alt={product.name || "Product image"}  
          width={300}
          height={300}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
            "opacity-0 group-hover:opacity-100 hover:scale-110",
            isInWishlistState
              ? "bg-red-500 text-white"
              : "bg-white text-stone-600 hover:bg-red-100 hover:text-red-500"
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-4 w-4", isInWishlistState && "fill-current")} />
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

        <div className="text-xs text-stone-500">
          Stock: {selectedWeight ? `${selectedWeight.quantity} units` : "Stock info unavailable"}
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
