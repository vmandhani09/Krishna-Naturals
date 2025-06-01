"use client";

import { useState, useEffect, useCallback } from "react";
import { CartItem } from "@/types";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper: Merge duplicates (items with the same SKU and weight)
  const deduplicateCart = useCallback((items: CartItem[]): CartItem[] => {
    const merged = items.reduce((acc: Record<string, CartItem>, item) => {
      const key = `${item.sku}-${item.weight}`;
      if (acc[key]) {
        acc[key].quantity += item.quantity;
      } else {
        acc[key] = { ...item };
      }
      return acc;
    }, {});
    return Object.values(merged);
  }, []);

  // 🔍 Fetch cart items
  const fetchCart = useCallback(async () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      try {
        const response = await fetch(`/api/cart/${userToken}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          // Deduplicate before setting state
          setCart(deduplicateCart(data));
        } else {
          console.error("Failed to fetch cart from API");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCart(deduplicateCart(guestCart));
    }
  }, [deduplicateCart]);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  const getCartItemsCount = useCallback(() => {
  return cart.reduce((total, item) => total + item.quantity, 0);
}, [cart]);


  const addToCart = async (item: CartItem) => {
  const userToken = localStorage.getItem("userToken");

  if (userToken) {
    try {
      const response = await fetch(`/api/cart/${userToken}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch cart for merging");

      const existingCart = await response.json();
      const mergedCart = deduplicateCart(existingCart);
      const existingItem = mergedCart.find(
        (cartItem: CartItem) => cartItem.sku === item.sku && cartItem.weight === item.weight
      );

      if (existingItem) {
        await fetch(`/api/cart/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: item.sku,
            weight: item.weight,
            quantity: existingItem.quantity + item.quantity,
          }),
        });
      } else {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userToken, ...item }),
        });
      }

      await fetchCart(); // ✅ Refresh cart after modification
      window.dispatchEvent(new Event("cartUpdated")); // ✅ Notify UI instantly
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  } else {
    // ✅ Guest cart logic
    let guestCart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const existingItemIndex = guestCart.findIndex(
      (cartItem: CartItem) => cartItem.sku === item.sku && cartItem.weight === item.weight
    );

    if (existingItemIndex !== -1) {
      guestCart[existingItemIndex].quantity += item.quantity; // ✅ Merge duplicate SKU + weight
    } else {
      guestCart.push(item);
    }

    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    setCart(guestCart);
    window.dispatchEvent(new Event("cartUpdated")); // ✅ Notify UI instantly
  }
};

  // 🔄 Update item quantity (by SKU and weight)
  const updateQuantity = async (sku: string, weight: string, newQuantity: number) => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        const response = await fetch(`/api/cart/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku, weight, quantity: newQuantity }),
        });
        if (response.ok) {
          await fetchCart();
          window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
        } else {
          console.error("Failed to update quantity in API");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    } else {
      let updatedCart = cart.map((item) => {
        if (item.sku === sku && item.weight === weight) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      updatedCart = deduplicateCart(updatedCart);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
    }
  };

  // ❌ Remove an item from the cart (by SKU and weight)
  const removeFromCart = async (sku: string, weight: string) => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        const response = await fetch(`/api/cart/remove`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku, weight }),
        });
        if (response.ok) {
          await fetchCart();
          window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
        } else {
          console.error("Failed to remove item from cart in API");
        }
      } catch (error) {
        console.error("Error removing item:", error);
      }
    } else {
      let updatedCart = cart.filter((item) => !(item.sku === sku && item.weight === weight));
      updatedCart = deduplicateCart(updatedCart);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
    }
  };

  // 🛍️ Clear entire cart
  const clearCart = async () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      try {
        const response = await fetch(`/api/cart/${userToken}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          await fetchCart();
          window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
        } else {
          console.error("Failed to clear cart in API");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      localStorage.removeItem("guestCart");
      setCart([]);
      window.dispatchEvent(new Event("cartUpdated")); // ✅ Dispatch event
    }
  };

  return {
    cart,
    getCartItemsCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal: () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}