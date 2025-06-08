"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";

export function useProductResolver(productIds: string[]) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!productIds || productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/products/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: productIds }),
        });

        if (!res.ok) {
          console.error("Failed to fetch products by IDs");
          return;
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productIds]);

  return { products, loading };
}
