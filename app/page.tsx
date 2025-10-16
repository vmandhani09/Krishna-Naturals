"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Truck, Shield, Clock, Star, Leaf, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/ui/product-card"
import { categories } from "@/lib/data"
import { Product } from "@/types"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()
        const featured = Array.isArray(data)
          ? data.filter((product: Product) => product.isFeatured)
          : (Object.values(data) as Product[]).filter((product) => product.isFeatured)
        setFeaturedProducts(featured)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      {/* Hero Section - Fresh split layout */}
      <section className="relative bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              <Leaf className="h-3 w-3 mr-2" /> Dryfruit Grove
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Nature&apos;s Finest Dry Fruits, Delivered Fresh
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Handpicked nuts, seeds, and spices sourced from trusted farms. Pure taste, premium quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-95 px-8">
                  Shop Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-secondary">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center"><Truck className="h-4 w-4 text-primary mr-2" /> Fast Delivery</div>
              <div className="flex items-center"><Shield className="h-4 w-4 text-primary mr-2" /> Quality Assured</div>
              <div className="flex items-center"><Clock className="h-4 w-4 text-primary mr-2" /> Freshly Packed</div>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Image
                src="https://res.cloudinary.com/dfv7xsiud/image/upload/v1750241064/5bddceab-bfa0-4d65-bcd0-5320ed50a5a0_ltlqud.png"
                alt="Dryfruit assortment hero"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <section className="bg-accent text-accent-foreground py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center gap-2">
          <Gift className="h-5 w-5" />
          <p className="text-base md:text-lg font-medium">Welcome offer: Flat 20% off on first order • Code: WELCOME20</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Shop by Category</h2>
          <p className="text-muted-foreground text-lg">Discover our premium collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.id}`}>
              <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer border-border bg-card hover:-translate-y-0.5">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Featured Products</h2>
          <p className="text-muted-foreground text-lg">Our most popular items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-secondary animate-pulse" />
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/60 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">Free shipping on orders above ₹500</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-muted-foreground">Premium quality products guaranteed</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick delivery within 2-3 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Priya Sharma",
              review: "Best quality dry fruits I've ever purchased. Fresh and tasty!",
              rating: 5,
            },
            {
              name: "Rajesh Kumar",
              review: "Excellent service and quick delivery. Highly recommended!",
              rating: 5,
            },
            {
              name: "Anita Patel",
              review: "Premium quality products at reasonable prices. Love it!",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <Card key={index} className="p-6 border-border bg-card">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&quot;{testimonial.review}&quot;</p>
                <p className="font-semibold text-foreground">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Ready to Experience Nature&apos;s Best?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of satisfied customers</p>
          <Link href="/shop">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-secondary">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
