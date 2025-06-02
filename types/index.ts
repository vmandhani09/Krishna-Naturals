import mongoose, { Types } from "mongoose";
export interface Product {
  name: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  sku: string;
  discountPrice?: number;
  tags?: string;
  brand?: string;
  weights: { label: string; price: number; quantity: number }[]; // ✅ Quantity per weight
  reviews: mongoose.Types.ObjectId[];
  isBranded: boolean;
  averageRating: number;
  isFeatured: boolean; // ✅ Featured flag added
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
  _id: Types.ObjectId | string;// ✅ Added ID field for consistency
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  mobile?: string;
  createdAt: Date;
  cart: string[]; // ✅ Updated to store ObjectId as a string array
  wishlist: string[]; // ✅ Updated to store ObjectId as a string array
}

export interface CartItem {
  sku: string;
  productName: string;
  productImage: string;
  weight: string;
  price: number;
  quantity: number;
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
