"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // 🔄 Fetch wishlist (on mount or update)
  const fetchWishlist = useCallback(async () => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        const response = await fetch(`/api/wishlist/${userToken}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        } else {
          console.error("Failed to fetch wishlist from API");
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      setWishlist(guestWishlist);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
    window.addEventListener("wishlistUpdated", fetchWishlist);
    return () => window.removeEventListener("wishlistUpdated", fetchWishlist);
  }, [fetchWishlist]);

  // ➕ Add to Wishlist
  const addToWishlist = async (product: Product) => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userToken, ...product }),
        });
        await fetchWishlist();
        window.dispatchEvent(new Event("wishlistUpdated"));
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    } else {
      let guestWishlist: Product[] = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      const exists = guestWishlist.some((item) => item.sku === product.sku);
      if (!exists) {
        guestWishlist.push(product);
        localStorage.setItem("guestWishlist", JSON.stringify(guestWishlist));
        setWishlist(guestWishlist);
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    }
  };

  // ❌ Remove from Wishlist
  const removeFromWishlist = async (sku: string) => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        await fetch(`/api/wishlist/remove`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userToken, sku }),
        });
        await fetchWishlist();
        window.dispatchEvent(new Event("wishlistUpdated"));
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    } else {
      let guestWishlist: Product[] = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      const updated = guestWishlist.filter((item) => item.sku !== sku);
      localStorage.setItem("guestWishlist", JSON.stringify(updated));
      setWishlist(updated);
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  // 🔢 Count
  const getWishlistCount = useCallback(() => wishlist.length, [wishlist]);

  return {
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistCount,
  };
}
