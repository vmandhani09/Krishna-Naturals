"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";

export default function WishlistPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("userToken");
      setIsLoggedIn(!!token);

      let ids: string[] = [];

      if (token) {
        const res = await fetch("/api/user/wishlist");
        const data = await res.json();
        ids = data?.wishlist?.map((item: Product) => item._id) ?? [];
      } else {
        ids = JSON.parse(localStorage.getItem("guestWishlistIds") || "[]");
      }

      setWishlistIds(ids);
      await fetchWishlistProducts(ids);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const fetchWishlistProducts = async (ids: string[]) => {
    if (!ids || ids.length === 0) {
      console.log("No wishlist items found");
      setWishlistProducts([]);
      return;
    }

    try {
      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }), // Ensure `ids` are passed correctly
      });

      if (!response.ok) throw new Error("Failed to fetch wishlist products");

      const data = await response.json();
      setWishlistProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch product data for wishlist:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
    window.addEventListener("wishlistUpdated", fetchWishlist);
    return () => window.removeEventListener("wishlistUpdated", fetchWishlist);
  }, []);
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
          <ProductCard key={String(product._id)} product={product} />
        ))}
      </div>
    </div>
  );
}
