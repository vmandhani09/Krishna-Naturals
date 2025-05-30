"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ui/product-card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { products } from "@/lib/products";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const product = products.find((p) => p.slug === slug);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const selectedWeightOption = product.weights.find((w) => w.label === selectedWeight);
  const relatedProducts = products.filter((p) => p.category === product.category && p.sku !== product.sku).slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedWeightOption) return;

    setIsLoading(true);

    try {
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
          <div className="relative">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-emerald-50">
              <Heart className="h-5 w-5 text-emerald-600" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Weight</label>
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
            </div>

            {selectedWeightOption && (
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">₹{selectedWeightOption.price}</div>
                <p className="text-sm text-gray-600">Price for {selectedWeight}</p>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
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
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
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
                <dd className="font-medium text-emerald-600">{product.stockQuantity} units</dd>
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
  )
}
