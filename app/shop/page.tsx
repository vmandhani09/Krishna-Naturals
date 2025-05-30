"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RangeSlider } from "@/components/ui/range-slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { categories } from "@/lib/data"
import { products } from "@/lib/products"

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedWeights, setSelectedWeights] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [sortBy, setSortBy] = useState("name")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const allWeights = Array.from(new Set(products.flatMap((p) => p.weights.map((w) => w.label))))

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)

      // Weight filter
      const matchesWeight =
        selectedWeights.length === 0 || product.weights.some((w) => selectedWeights.includes(w.label))

      // Price filter
      const minPrice = Math.min(...product.weights.map((w) => w.price))
      const maxPrice = Math.max(...product.weights.map((w) => w.price))
      const matchesPrice = maxPrice >= priceRange[0] && minPrice <= priceRange[1]

      return matchesSearch && matchesCategory && matchesWeight && matchesPrice
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Math.min(...a.weights.map((w) => w.price)) - Math.min(...b.weights.map((w) => w.price))
        case "price-high":
          return Math.max(...b.weights.map((w) => w.price)) - Math.max(...a.weights.map((w) => w.price))
        case "rating":
          return b.averageRating - a.averageRating
       // Assuming `id` is a timestamp or similar
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [searchTerm, selectedCategories, selectedWeights, priceRange, sortBy])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId])
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
    }
  }

  const handleWeightChange = (weight: string, checked: boolean) => {
    if (checked) {
      setSelectedWeights((prev) => [...prev, weight])
    } else {
      setSelectedWeights((prev) => prev.filter((w) => w !== weight))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedWeights([])
    setPriceRange([0, 2000])
    setSortBy("name")
  }

  const hasActiveFilters =
    searchTerm ||
    selectedCategories.length > 0 ||
    selectedWeights.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 2000

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-4">Shop All Products</h1>
        <p className="text-stone-600">Discover our premium collection of dry fruits, nuts, seeds, and spices</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
          <Input
            type="text"
            placeholder="Search products by name, brand, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-stone-300 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Categories */}
          <div className="flex-1">
            <Label className="text-sm font-medium text-stone-700 mb-2 block">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <span className="text-sm">
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Weights */}
          <div className="flex-1">
            <Label className="text-sm font-medium text-stone-700 mb-2 block">Weights</Label>
            <div className="flex flex-wrap gap-2">
              {allWeights.map((weight) => (
                <label key={weight} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedWeights.includes(weight)}
                    onCheckedChange={(checked) => handleWeightChange(weight, checked as boolean)}
                  />
                  <span className="text-sm">{weight}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex-1">
            <Label className="text-sm font-medium text-stone-700 mb-2 block">
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </Label>
            <RangeSlider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
          <div className="flex items-center space-x-4">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-stone-600">
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
            <span className="text-sm text-stone-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">No products found</h3>
          <p className="text-stone-600 mb-6">Try adjusting your search or filter criteria</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}
