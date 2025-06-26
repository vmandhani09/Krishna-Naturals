"use client"

import { useEffect, useState, useMemo } from "react"
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
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams(); // ← This reads the query params

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category");
    if (categoryFromQuery) {
      setSelectedCategories([categoryFromQuery]);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products"); // ✅ Fetch from database
        const data = await response.json();
        setProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const allWeights = useMemo(() => {
    return Array.from(new Set(products.flatMap((p) => p.weights?.map((w) => w.label) ?? [])));
  }, [products]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedCategories.length > 0 ||
    selectedWeights.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 2000;

  const filteredProducts = useMemo(() => {
    if (!hasActiveFilters) return products; // ✅ Show all products initially

    return products.filter((product) => {
      const matchesSearch =
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (Array.isArray(product.tags)
          ? product.tags.some((tag: string) => tag.trim().toLowerCase().includes(searchTerm.toLowerCase()))
          : product.tags?.split(",").some((tag: string) => tag.trim().toLowerCase().includes(searchTerm.toLowerCase())) ?? false);

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesWeight = selectedWeights.length === 0 || product.weights?.some((w) => selectedWeights.includes(w.label));

      const minPrice = Math.min(...(product.weights?.map((w) => w.price) ?? [0]));
      const maxPrice = Math.max(...(product.weights?.map((w) => w.price) ?? [0]));
      const matchesPrice = maxPrice >= priceRange[0] && minPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesWeight && matchesPrice;
    }).sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Math.min(...(a.weights?.map((w) => w.price) ?? [0])) - Math.min(...(b.weights?.map((w) => w.price) ?? [0]));
        case "price-high":
          return Math.max(...(b.weights?.map((w) => w.price) ?? [0])) - Math.max(...(a.weights?.map((w) => w.price) ?? [0]));
        case "rating":
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, searchTerm, selectedCategories, selectedWeights, priceRange, sortBy, hasActiveFilters]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)));
  };

  const handleWeightChange = (weight: string, checked: boolean) => {
    setSelectedWeights((prev) => (checked ? [...prev, weight] : prev.filter((w) => w !== weight)));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedWeights([]);
    setPriceRange([0, 2000]);
    setSortBy("name");
  };

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
         <div className="flex flex-wrap gap-3 mt-2">
  {/* All Button */}
  <button
    onClick={() => setSelectedCategories([])}
    className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-200 border ${
      selectedCategories.length === 0 || selectedCategories.length === categories.length
        ? "bg-emerald-600 text-white border-emerald-600"
        : "bg-white text-stone-700 border-stone-300 hover:bg-emerald-50 hover:border-emerald-400"
    }`}
  >
    All
  </button>

  {/* Category Buttons */}
  {categories.map((category) => {
    const isSelected = selectedCategories.includes(category.id);

    return (
      <button
        key={category.id}
        onClick={() => {
          let updated = [];
          if (isSelected) {
            updated = selectedCategories.filter((id) => id !== category.id);
          } else {
            updated = [...selectedCategories, category.id];
          }

          // If all categories selected manually → switch to "All" logic
          if (updated.length === categories.length) {
            setSelectedCategories([]);
          } else {
            setSelectedCategories(updated);
          }
        }}
        className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-200 border ${
          isSelected
            ? "bg-emerald-600 text-white border-emerald-600"
            : "bg-white text-stone-700 border-stone-300 hover:bg-emerald-50 hover:border-emerald-400"
        }`}
      >
        <span className="inline-flex items-center gap-1">
          {category.icon} {category.name}
        </span>
      </button>
    );
  })}
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
