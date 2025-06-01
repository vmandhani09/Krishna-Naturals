"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  // ✅ Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("userToken"); // Change this based on your auth system
    setIsLoggedIn(!!user);

    // ✅ Check if product is already in wishlist (for both logged-in & guests)
    const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
    setIsInWishlistState(guestWishlist.includes(product.sku));
  }, [product.sku]);

  // ✅ Handle wishlist toggle
  const toggleWishlist = async () => {
  try {
    if (isLoggedIn) {
      const response = await fetch("/api/user/wishlist", {
        method: isInWishlistState ? "DELETE" : "POST", // ✅ Toggle wishlist action
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: product.sku }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update wishlist");

      setIsInWishlistState(!isInWishlistState); // ✅ Instantly update UI
    } else {
      // ✅ Store in localStorage for guests
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
      const updatedWishlist = isInWishlistState
        ? guestWishlist.filter((id: string) => id !== product.sku)
        : [...guestWishlist, product.sku];

      localStorage.setItem("guestWishlist", JSON.stringify(updatedWishlist));
      setIsInWishlistState(!isInWishlistState); // ✅ Instantly update UI
    }

    // 🔄 ✅ Notify WishlistPage to refresh wishlist data
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (error) {
    console.error("Wishlist update error:", error);
  }
};

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-stone-200 bg-white">
      <div className="relative overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
            "opacity-0 group-hover:opacity-100 hover:scale-110",
            isInWishlistState ? "bg-red-500 text-white" : "bg-white text-stone-600 hover:bg-red-50 hover:text-red-500"
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-4 w-4", isInWishlistState && "fill-current")} />
        </button>

        {product.stockQuantity < 20 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-2">
          <div className="text-emerald-600 font-bold text-lg">
            {product.weights.length > 0
              ? `₹${Math.min(...product.weights.map((w) => w.price))} - ₹${Math.max(...product.weights.map((w) => w.price))}`
              : "Price not available"}
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        <div className="text-xs text-stone-500">Stock: {product.stockQuantity} units</div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/product/${product.slug}`} onClick={() => console.log("Navigating to:", product.slug)}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:shadow-lg">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Select Options
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

//   return (
//     <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-stone-200 bg-white">
//       <div className="relative overflow-hidden">
//         <Image
//           src={product.image || "/placeholder.svg"}
//           alt={product.name}
//           width={300}
//           height={300}
//           className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
//         />
//         <button
//           onClick={() => toggleWishlist(product.sku)}
//           className={cn(
//             "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
//             "opacity-0 group-hover:opacity-100 hover:scale-110",
//             isInWishlist(product.sku)
//               ? "bg-red-500 text-white"
//               : "bg-white text-stone-600 hover:bg-red-50 hover:text-red-500",
//           )}
//           aria-label="Add to wishlist"
//         >
//           <Heart className={cn("h-4 w-4", isInWishlist(product.sku) && "fill-current")} />
//         </button>

//         {isLowStock && (
//           <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</div>
//         )}
//       </div>

//       <CardContent className="p-4">
//         <div className="flex items-center mb-2">
//           {product.averageRating > 0 && (
//             <div className="flex items-center space-x-1">
//               <Star className="h-4 w-4 text-yellow-400 fill-current" />
//               <span className="text-sm text-stone-600">{product.averageRating.toFixed(1)}</span>
//               <span className="text-xs text-stone-500">({product.reviews.length})</span>
//             </div>
//           )}
//         </div>

//         <h3 className="font-semibold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
//           {product.name}
//         </h3>
//         <p className="text-sm text-stone-600 mb-3 line-clamp-2">{product.description}</p>

//         <div className="flex items-center justify-between mb-2">
//           <div className="text-emerald-600 font-bold text-lg">
//             {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
//           </div>
//           <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
//             {product.category}
//           </span>
//         </div>

//         <div className="text-xs text-stone-500">Stock: {product.stockQuantity} units</div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0">
//         <Link href={`/product/${product.slug}`} className="w-full">
//           <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:shadow-lg">
//             <ShoppingCart className="h-4 w-4 mr-2" />
//             Select Options
//           </Button>
//         </Link>
//       </CardFooter>
//     </Card>
//   )
// }
