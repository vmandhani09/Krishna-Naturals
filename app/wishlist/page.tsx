"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import products from "@/lib/products";
import { Product } from "@/types";

export default function WishlistPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // ✅ Fetch wishlist (Runs on initial load & listens for updates)
  const fetchWishlist = () => {
    const userToken = localStorage.getItem("userToken");
    setIsLoggedIn(!!userToken);

    if (userToken) {
      fetch("/api/user/wishlist", {
        method: "GET",
        headers: { "user-id": userToken },
      })
        .then((res) => res.json())
        .then((data) => setWishlist(data.wishlist ?? []))
        .catch((error) => console.error("Error fetching wishlist:", error));
    } else {
      setWishlist(JSON.parse(localStorage.getItem("guestWishlist") ?? "[]"));
    }
  };

  useEffect(() => {
    fetchWishlist(); // ✅ Initial fetch

    // 🔄 ✅ Listen for wishlist updates from ProductCard.tsx
    window.addEventListener("wishlistUpdated", fetchWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", fetchWishlist);
    };
  }, []);

  useEffect(() => {
    setWishlistProducts(products.filter((product) => wishlist.includes(product.sku)));
  }, [wishlist]);

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Heart className="h-24 w-24 text-stone-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Your wishlist is empty</h1>
          <p className="text-stone-600 mb-8">Save products you love to your wishlist</p>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">My Wishlist</h1>
        <p className="text-stone-600">
          {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} in your wishlist
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </div>
  );
}