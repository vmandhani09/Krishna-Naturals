"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";

function isValidToken(token: string | null): boolean {
  return !!token && token !== "undefined" && token !== "null";
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch wishlist products by IDs
  const fetchProductsByIds = async (ids: string[]) => {
    if (!ids || ids.length === 0) {
      setWishlist([]);
      return;
    }

    try {
      const response = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to fetch products by IDs");

      const data = await response.json();
      setWishlist(data.products || []);
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      setWishlist([]);
    }
  };

  // Fetch wishlist based on login state
  const fetchWishlist = useCallback(async () => {
    try {
      const userToken = localStorage.getItem("userToken");
      setIsLoggedIn(isValidToken(userToken));

      if (isValidToken(userToken)) {
        // Logged-in: get wishlist IDs from API
        const res = await fetch("/api/user/wishlist", {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user wishlist");

        const data = await res.json();
        const ids: string[] = data.wishlist || [];
        await fetchProductsByIds(ids);
      } else {
        // Guest: get IDs from localStorage
        const guestWishlistIds: string[] = JSON.parse(localStorage.getItem("guestWishlistIds") || "[]");
        await fetchProductsByIds(guestWishlistIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
    window.addEventListener("wishlistUpdated", fetchWishlist);
    return () => window.removeEventListener("wishlistUpdated", fetchWishlist);
  }, [fetchWishlist]);

  // Add product to wishlist
  const addToWishlist = async (product: Product) => {
    const productId = product._id;
    if (!productId) return console.error("Product missing _id");

    const userToken = localStorage.getItem("userToken");

    try {
      if (isValidToken(userToken)) {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({ productId: String(productId) }), 
        });
        if (!res.ok) throw new Error("Failed to add to wishlist");
      } else {
        let guestWishlistIds: string[] = JSON.parse(localStorage.getItem("guestWishlistIds") || "[]");
        if (!guestWishlistIds.includes(String(productId))) {
          guestWishlistIds.push(String(productId));
          localStorage.setItem("guestWishlistIds", JSON.stringify(guestWishlistIds));
        }
      }

      await fetchWishlist();
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string) => {
    const userToken = localStorage.getItem("userToken");

    try {
      if (isValidToken(userToken)) {
        const res = await fetch("/api/user/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({ productId }), // <-- FIXED
        });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
      } else {
        let guestWishlistIds: string[] = JSON.parse(localStorage.getItem("guestWishlistIds") || "[]");
        guestWishlistIds = guestWishlistIds.filter((id) => id !== productId);
        localStorage.setItem("guestWishlistIds", JSON.stringify(guestWishlistIds));
      }

      await fetchWishlist();
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };
const syncLocalWishlistToDB = async (userToken: string) => {
  const localWishlist: { productId: string }[] = JSON.parse(localStorage.getItem("guestWishlistIds") || "[]");
  if (!localWishlist.length) return;

  try {
    for (const item of localWishlist) {
      await fetch("/api/user/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId: item.productId }),
      });
    }
    localStorage.removeItem("guestWishlistIds");
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (err) {
    console.error("Wishlist sync failed", err);
  }
};
  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlist?.some((item) => item._id === productId) ?? false;
  };

  return {
    syncLocalWishlistToDB,
    wishlist,
    isLoggedIn,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlist.length,
  };
}
