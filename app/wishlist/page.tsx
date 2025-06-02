"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";

import { Product } from "@/types";

export default function WishlistPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Fetch wishlist SKUs
  const fetchWishlist = async () => {
    try {
      const userToken = localStorage.getItem("userToken");
      setIsLoggedIn(!!userToken);

      let wishlistData: string[] = [];

      if (userToken) {
        const response = await fetch("/api/user/wishlist", {
          method: "GET",
          headers: { "user-id": userToken },
        });

        if (!response.ok) throw new Error("Failed to fetch wishlist");

        const data = await response.json();
        wishlistData = data?.wishlist ?? [];
      } else {
        wishlistData = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
      }

      setWishlist(wishlistData);

      if (wishlistData.length > 0) {
        fetchWishlistProducts(wishlistData);
      } else {
        setWishlistProducts([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  // Fetch full product data for wishlist SKUs
  const fetchWishlistProducts = async (wishlistIds: string[]) => {
    try {
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }

      const userToken = localStorage.getItem("userToken");

      if (userToken) {
        const response = await fetch("/api/products", {
          method: "POST",
          body: JSON.stringify({ skus: wishlistIds }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch wishlist products");

        const data = await response.json();
        setWishlistProducts(data?.products ?? []);
      } else {
        // Guest wishlist fallback (you might want to fetch full products differently)
        const localWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
        setWishlistProducts(localWishlist ?? []);
      }
    } catch (error) {
      console.error("Error fetching wishlist products:", error);
    }
  };

  useEffect(() => {
    fetchWishlist();

    // Listen for wishlist updates from ProductCard
    window.addEventListener("wishlistUpdated", fetchWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", fetchWishlist);
    };
  }, []);

  // Check if a product SKU is in wishlist
  const isInWishlist = (sku: string) => wishlist.includes(sku);

  // Toggle wishlist item
  const toggleWishlist = async (sku: string) => {
    try {
      if (isLoggedIn) {
        const method = isInWishlist(sku) ? "DELETE" : "POST";

        const response = await fetch("/api/user/wishlist", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to update wishlist");
      } else {
        // Guest wishlist stored locally
        const guestWishlistRaw = localStorage.getItem("guestWishlist");
        const guestWishlist: string[] = guestWishlistRaw ? JSON.parse(guestWishlistRaw) : [];

        let updatedWishlist: string[];

        if (isInWishlist(sku)) {
          updatedWishlist = guestWishlist.filter((item) => item !== sku);
        } else {
          updatedWishlist = [...guestWishlist, sku];
        }

        localStorage.setItem("guestWishlist", JSON.stringify(updatedWishlist));
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    }
  };

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
        {wishlistProducts.map((product, index) => (
          <ProductCard
            key={`${product.sku}-${index}`}
            product={product}
            isInWishlist={isInWishlist(product.sku)}
            onToggleWishlist={() => toggleWishlist(product.sku)}
          />
        ))}
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ProductCard } from "@/components/ui/product-card";
// import { Button } from "@/components/ui/button";
// import { Heart, ShoppingBag } from "lucide-react";

// import { Product } from "@/types";

// export default function WishlistPage() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [wishlist, setWishlist] = useState<string[]>([]);
//   const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

//  const fetchWishlist = async () => {
//   try {
//     const userToken = localStorage.getItem("userToken");
//     setIsLoggedIn(!!userToken);

//     let wishlistData: string[] = [];

//     if (userToken) {
//       const response = await fetch("/api/user/wishlist", {
//         method: "GET",
//         headers: { "user-id": userToken },
//       });

//       if (!response.ok) throw new Error("Failed to fetch wishlist");

//       const data = await response.json();
//       wishlistData = data?.wishlist ?? [];
//     } else {
//       wishlistData = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");
//     }

//     console.log("Wishlist SKUs:", wishlistData); // ✅ Debugging

//     setWishlist(wishlistData);

//     // ✅ Ensure `wishlistProducts` is updated AFTER fetching SKUs
//     if (wishlistData.length > 0) {
//       fetchWishlistProducts(wishlistData);
//     } else {
//       setWishlistProducts([]);
//     }
//   } catch (error) {
//     console.error("Error fetching wishlist:", error); 
//   }
// };
// const fetchWishlistProducts = async (wishlistIds: string[]) => {
//   try {
//     if (wishlistIds.length === 0) {
//       setWishlistProducts([]);
//       return;
//     }

//     // ✅ If user is logged in, fetch from API; otherwise, use local data
//     const userToken = localStorage.getItem("userToken");

//     if (userToken) {
//       const response = await fetch("/api/products", {
//         method: "POST",
//         body: JSON.stringify({ skus: wishlistIds }),
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!response.ok) throw new Error("Failed to fetch wishlist products");

//       const data = await response.json();
//       console.log("Fetched wishlist products:", data.products);

//       setWishlistProducts(data?.products ?? []);
//     } else {
//       // 🚀 Fallback: LocalStorage-based Wishlist
//       console.log("Fetching guest wishlist from localStorage");
//       const localWishlist = JSON.parse(localStorage.getItem("guestWishlist") ?? "[]");

//       setWishlistProducts(localWishlist ?? []);
//     }
//   } catch (error) {
//     console.error("Error fetching wishlist products:", error);
//   }
// };
//   useEffect(() => {
//     fetchWishlist(); // ✅ Initial fetch

//     // 🔄 ✅ Listen for wishlist updates from ProductCard.tsx
//     window.addEventListener("wishlistUpdated", fetchWishlist);

//     return () => {
//       window.removeEventListener("wishlistUpdated", fetchWishlist);
//     };
//   }, []);



//   if (wishlistProducts.length === 0) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="text-center">
//           <Heart className="h-24 w-24 text-stone-300 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-stone-800 mb-2">Your wishlist is empty</h1>
//           <p className="text-stone-600 mb-8">Save products you love to your wishlist</p>
//           <Link href="/shop">
//             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
//               <ShoppingBag className="h-4 w-4 mr-2" />
//               Continue Shopping
//             </Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }
  

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-stone-800 mb-2">My Wishlist</h1>
//         <p className="text-stone-600">
//           {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} in your wishlist
//         </p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {wishlistProducts.map((product, index) => (
//     <ProductCard key={`${product.sku}-${index}`} product={product} />
//   ))}

//       </div>
//     </div>
//   );
// }