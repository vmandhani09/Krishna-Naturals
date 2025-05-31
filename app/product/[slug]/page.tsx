"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ui/product-card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils"; // ✅ Ensure cn is imported
import { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // ✅ Fetch product dynamically from API
 async function fetchProduct() {
  try {
    const response = await fetch(`/api/products/${slug}`);
    const data = await response.json();

    console.log("API Response:", data); // ✅ Debugging step

    if (!response.ok || !data) throw new Error("Product not found");

    setProduct(data);
    setRelatedProducts(data.relatedProducts ?? []);
  } catch (error) {
    console.error("Error fetching product:", error);
    setProduct(null);
  }
}
  // ✅ Detect user authentication & check wishlist status
  useEffect(() => {
    const userToken = localStorage.getItem("userToken"); // Replace with actual auth logic
    setIsLoggedIn(!!userToken);

    if (userToken) {
      fetch("/api/user/wishlist", {
        method: "GET",
        headers: { "user-id": userToken },
      })
        .then((res) => res.json())
        .then((data) => setIsInWishlist(data.wishlist.includes(product?.sku)))
        .catch((error) => console.error("Error fetching wishlist:", error));
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
      setIsInWishlist(guestWishlist.includes(product?.sku));
    }
  }, [product]);

  // ✅ Handle wishlist toggle
  const toggleWishlist = async () => {
    try {
      if (isLoggedIn) {
        const response = await fetch("/api/user/wishlist", {
          method: isInWishlist ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: product?.sku }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update wishlist");

        setIsInWishlist(!isInWishlist);
        window.dispatchEvent(new Event("wishlistUpdated")); // ✅ Notify WishlistPage
      } else {
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
        const updatedWishlist = isInWishlist
          ? guestWishlist.filter((id: string) => id !== product?.sku)
          : [...guestWishlist, product?.sku];

        localStorage.setItem("guestWishlist", JSON.stringify(updatedWishlist));
        setIsInWishlist(!isInWishlist);
        window.dispatchEvent(new Event("wishlistUpdated")); // ✅ Notify WishlistPage
      }
    } catch (error) {
      console.error("Wishlist update error:", error);
    }
  };

  // ✅ Handle Add to Cart Function
  const handleAddToCart = async () => {
    if (!product || !selectedWeight) return;

    setIsLoading(true);

    try {
      const selectedWeightOption = product.weights.find((w) => w.label === selectedWeight);
      if (!selectedWeightOption) throw new Error("Invalid weight option");

      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: product.sku, // ✅ Using SKU instead of productId
          productName: product.name,
          productImage: product.image,
          weight: selectedWeight,
          price: selectedWeightOption.price,
          quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to add product to cart");

      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <button onClick={toggleWishlist} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-emerald-50">
              <Heart className={cn("h-5 w-5", isInWishlist ? "text-red-500 fill-current" : "text-emerald-600")} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

          {/* Weight Selection */}
          <Select value={selectedWeight} onValueChange={setSelectedWeight}>
            <SelectTrigger>
              <SelectValue placeholder="Choose weight option" />
            </SelectTrigger>
            <SelectContent>
              {product.weights.map((weight) => (
                <SelectItem key={weight.label} value={weight.label}>
                  {weight.label} - ₹{weight.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add to Cart */}
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddToCart} disabled={!selectedWeight}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}