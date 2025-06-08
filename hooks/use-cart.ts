"use client";

import { useState, useEffect, useCallback } from "react";
import { CartItem, Product } from "@/types";

interface LocalCartItem {
  productId: string;
  weight: string;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<(CartItem & { product: Product | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocalCart = (): LocalCartItem[] => {
    try {
      return JSON.parse(localStorage.getItem("guestCart") || "[]");
    } catch {
      return [];
    }
  };

  const setLocalCart = (items: LocalCartItem[]) => {
    localStorage.setItem("guestCart", JSON.stringify(items));
  };

  const fetchProductDetails = async (items: any[]) => {
    if (!items.length) return [];
    const ids = [...new Set(items.map((item) => item.productId))];

    try {
      const res = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      const products = Array.isArray(data.products) ? data.products : [];

      return items.map((item) => ({
        ...item,
        product: products.find((p: Product) => p._id === item.productId) || null,
      }));
    } catch (error) {
      console.error("Error fetching product details", error);
      return items.map((item) => ({ ...item, product: null }));
    }
  };

  const syncLocalCartToDB = async (userToken: string) => {
    const localCart = getLocalCart();
    if (!localCart.length) return;

    try {
      for (const item of localCart) {
        await fetch("/api/user/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            weight: item.weight,
            quantity: item.quantity,
          }),
        });
      }
      setLocalCart([]);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Cart sync failed", err);
    }
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      await syncLocalCartToDB(userToken);
      const res = await fetch("/api/user/cart", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const { cart: dbCart } = await res.json();
      const items = Array.isArray(dbCart)
        ? dbCart.map((item: any) => ({
            productId: item.productId,
            weight: item.weight,
            quantity: item.quantity,
            userId: item.userId,
          }))
        : [];

      const merged = await fetchProductDetails(items);
      setCart(merged);
    } else {
      const localCart = getLocalCart();
      const merged = await fetchProductDetails(localCart);
      setCart(merged);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, [fetchCart]);

  const addToCart = async (productId: string, weight: string, quantity = 1) => {
    const userToken = localStorage.getItem("userToken");
    console.log("addToCart called", { productId, weight, quantity, userToken });

    if (userToken) {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId, weight, quantity }),
      });
      const data = await res.json();
      console.log("API response:", data);
      if (!res.ok) {
        console.error("Failed to add to cart:", data);
      }
    } else {
      let localCart = getLocalCart();
      const index = localCart.findIndex(
        (item) => item.productId === productId && item.weight === weight  
      );

      if (index !== -1) {
        localCart[index].quantity = quantity; // <-- SET instead of ADD
      } else {
        localCart.push({ productId, weight, quantity });
      }
      setLocalCart(localCart);
      console.log("Updated guest cart:", localCart);
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromCart = async (productId: string, weight: string) => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      await fetch("/api/user/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId, weight }),
      });
    } else {
      let localCart = getLocalCart();
      localCart = localCart.filter(
        (item) => !(String(item.productId) === productId && String(item.weight) === weight)
      );
      setLocalCart(localCart);
    }
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = async (productId: string, weight: string, quantity: number) => {
    // Optimistically update UI
    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.productId) === String(productId) && String(item.weight) === String(weight)
          ? { ...item, quantity }
          : item
      )
    );

    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId, weight, quantity }),
      });
      // Do NOT call fetchCart or dispatch cartUpdated here!
    } else {
      let localCart = getLocalCart();
      localCart = localCart.map((item) =>
        item.productId === productId && item.weight === weight
          ? { ...item, quantity }
          : item
      );
      setLocalCart(localCart);
      // Do NOT dispatch cartUpdated here!
    }
  };

  const clearCart = async () => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      await fetch("/api/user/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
    } else {
      setLocalCart([]);
    }

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  const getCartTotal = () =>
    cart.reduce((total, item) => {
      const price =
        item.product && Array.isArray(item.product.weights)
          ? item.product.weights.find((w) => w.label === item.weight)?.price || 0
          : 0;
      return total + price * item.quantity;
    }, 0);

  return {
    cart,
    loading,
    getCartItemsCount,
    syncLocalCartToDB,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  };
}
