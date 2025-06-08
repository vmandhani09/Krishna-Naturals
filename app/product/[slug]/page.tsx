// app/products/[slug]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ui/product-card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [selectedWeight, setSelectedWeight] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();

        if (!response.ok || !data) throw new Error("Product not found");

        setProduct(data);

        // Fetch related products (optional, adjust API as needed)
        if (data.category) {
          const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}&exclude=${data._id}`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedProducts(Array.isArray(relData.products) ? relData.products : []);
          } else {
            setRelatedProducts([]);
          }
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.weights?.length) {
      setSelectedWeight(product.weights[0].label);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Product...</h1>
        <p className="text-gray-600">Please wait while we fetch the product details.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const selectedWeightOption = product.weights.find(
    (w) => w.label === selectedWeight
  );

  const inWishlist = isInWishlist(String(product._id));

  const handleWishlistToggle = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(String(product._id));
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedWeightOption) return;
    addToCart(
      String(product._id),
      selectedWeightOption.label,
      quantity
    );
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/home" className="text-emerald-600 hover:underline">
              Home
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <a href="/shop" className="text-emerald-600 hover:underline">
              Shop
            </a>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative group">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300",
                "opacity-0 group-hover:opacity-100 hover:scale-110",
                inWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white text-stone-600 hover:bg-red-50 hover:text-red-500"
              )}
              aria-label="Add to wishlist"
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(128 reviews)</span>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

          {/* Weight Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Weight
              </label>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose weight option" />
                </SelectTrigger>
                <SelectContent>
                  {product.weights.map((weight, index) => (
                    <SelectItem key={weight.label} value={weight.label}>
                      {weight.label} - ₹{weight.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWeightOption && (
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  ₹{selectedWeightOption.price}
                </div>
                <p className="text-sm text-gray-600">
                  Price for {selectedWeight}
                </p>
              </div>
            )}
          </div>
          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <Select
                value={quantity.toString()}
                onValueChange={(value) => setQuantity(Number.parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAddToCart}
                disabled={!selectedWeight}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>

              <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                <Heart className={`h-4 w-4 ${inWishlist ? "text-red-500" : ""}`} />
              </Button>
            </div>

            {/* ✅ Success Message Below the Button */}
            {showSuccessMessage && (
              <div className="text-green-600 font-medium mt-2">
                ✅ {product.name} ({selectedWeight}) added to cart successfully!
              </div>
            )}
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-gray-600">On orders ₹500+</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Quality Assured</p>
              <p className="text-xs text-gray-600">Premium grade</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-600">7-day policy</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">SKU:</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Brand:</dt>
                <dd className="font-medium">{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Stock:</dt>
                <dd className="font-medium text-emerald-600">{product.weights.reduce((total, weight) => total + weight.quantity, 0)} units</dd>
              </div>
              {product.tags && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tags:</dt>
                  <dd className="font-medium">{product.tags}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.sku} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

