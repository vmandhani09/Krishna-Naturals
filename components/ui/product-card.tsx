"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const minPrice = Math.min(...product.weights.map((w) => w.price))
  const maxPrice = Math.max(...product.weights.map((w) => w.price))
  const isLowStock = product.stockQuantity < 20

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
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
            "opacity-0 group-hover:opacity-100 hover:scale-110",
            isInWishlist(product.id)
              ? "bg-red-500 text-white"
              : "bg-white text-stone-600 hover:bg-red-50 hover:text-red-500",
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
        </button>

        {isLowStock && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {product.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-stone-600">{product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-stone-500">({product.reviews.length})</span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-lg text-stone-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-2">
          <div className="text-emerald-600 font-bold text-lg">
            {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        <div className="text-xs text-stone-500">Stock: {product.stockQuantity} units</div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/product/${product.slug}`} className="w-full">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:shadow-lg">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Select Options
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
