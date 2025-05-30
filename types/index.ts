export interface Product {
  name: string
  slug: string
  image: string
  description: string
  category: string
  sku: string
  stockQuantity: number
  discountPrice?: number
  tags?: string
  brand?: string
  weights: { label: string; price: number }[]
  reviews: Review[]
  isBranded: boolean
  averageRating: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "user" | "admin"
  mobile?: string
  createdAt: Date
}

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  weight: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerMobile: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    email: string
    mobile: string
    address: string
    city: string
    pincode: string
  }
  createdAt: Date
}
