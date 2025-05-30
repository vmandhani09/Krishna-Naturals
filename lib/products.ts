import { Product } from "@/types";

export const products: Product[] = [
  {
    name: "Premium Almonds",
    slug: "premium-almonds",
    image: "/placeholder.svg?height=300&width=300",
    description: "High-quality California almonds, rich in protein and healthy fats. Perfect for snacking or cooking.",
    category: "nuts",
    sku: "ALM-001",
    stockQuantity: 100,
    brand: "Krishna Naturals",
    tags: "healthy, protein, premium",
    weights: [
      { label: "250g", price: 299 },
      { label: "500g", price: 549 },
      { label: "1kg", price: 999 },
    ],
    discountPrice: 279,
    reviews: [],
    averageRating: 0,
    isBranded: true, // ✅ Added isBranded field
  },
  {
    name: "Organic Dates",
    slug: "organic-dates",
    image: "/placeholder.svg?height=300&width=300",
    description: "Sweet and nutritious organic dates from Rajasthan. Natural energy booster.",
    category: "dryfruits",
    sku: "DAT-001",
    stockQuantity: 15,
    brand: "Krishna Naturals",
    tags: "organic, sweet, energy",
    weights: [
      { label: "250g", price: 199 },
      { label: "500g", price: 349 },
      { label: "1kg", price: 649 },
    ],
    discountPrice: 179,
    reviews: [],
    averageRating: 0,
    isBranded: true, // ✅ Added isBranded field
  },
  {
    name: "Mixed Seeds",
    slug: "mixed-seeds",
    image: "/placeholder.svg?height=300&width=300",
    description: "Healthy mix of pumpkin, sunflower, and chia seeds. Rich in omega-3 and minerals.",
    category: "seeds",
    sku: "SED-001",
    stockQuantity: 50,
    brand: "Krishna Naturals",
    tags: "omega-3, healthy, mix",
    weights: [
      { label: "100g", price: 149 },
      { label: "250g", price: 299 },
      { label: "500g", price: 549 },
    ],
    discountPrice: 129,
    reviews: [],
    averageRating: 0,
    isBranded: true, // ✅ Added isBranded field
  },
];

export default products;