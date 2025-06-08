"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/types"


export default function CartPage() {
  const { cart, getCartItemsCount, removeFromCart, updateQuantity, getCartTotal, clearCart, loading } = useCart();

  if (loading) {
    return <div className="text-center py-16">Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started</p>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">{cart.length} item(s) in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <Card
              key={`${String(item.productId)}-${String(item.weight ?? "")}-${idx}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-24 h-32 sm:h-24">
                    <Image
                      src={item.product?.image || "/placeholder.svg"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover rounded-lg"
                    />

                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900">{item.product?.name || "Product"}</h3>
                    <p className="text-sm text-gray-600">Weight: {item.weight}</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹
                      {item.product?.weights
                        ? item.product.weights.find((w) => w.label === item.weight)?.price || 0
                        : 0}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(String(item.productId), String(item.weight))}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("Decrement", item.quantity, "->", item.quantity - 1);
                          updateQuantity(String(item.productId), String(item.weight), item.quantity - 1);
                        }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("Increment", item.quantity, "->", item.quantity + 1);
                          updateQuantity(String(item.productId), String(item.weight), item.quantity + 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-medium">
                      Total: ₹
                      {(item.product?.weights
                        ? item.product.weights.find((w) => w.label === item.weight)?.price || 0
                        : 0) * item.quantity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-600">{getCartTotal() >= 500 ? "Free" : "₹50"}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{getCartTotal() + (getCartTotal() >= 500 ? 0 : 50)}</span>
                  </div>
                </div>
              </div>

              {getCartTotal() < 500 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded mb-4">
                  Add ₹{500 - getCartTotal()} more for free shipping!
                </p>
              )}

              <Link href="/checkout">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Proceed to Checkout</Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">Secure checkout with SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
