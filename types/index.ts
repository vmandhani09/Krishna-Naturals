import mongoose, { Types } from "mongoose";
export interface Product {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  sku: string;
  discountPrice?: number;
  tags?: string;
  brand?: string;
  weights: { label: string; price: number; quantity: number }[];
  reviews: mongoose.Types.ObjectId[];
  isBranded: boolean;
  averageRating: number;
  isFeatured: boolean;
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
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  mobile?: string;
  createdAt: Date;
  cart: string[];
  wishlist: string[];
}

export interface CartItem {
  _id?: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  weight: string;
  quantity: number;
  userId: string | Types.ObjectId;
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
