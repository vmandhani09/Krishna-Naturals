"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = getCartTotal();
  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Check if user is logged in
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        // Guest user → no API call
        clearCart();
        toast.success("Order placed successfully!");
        router.push("/account");
        return;
      }

      // User is logged in → create order in database

      const items = cart.map((item) => {
        const price =
          item.product?.weights?.find(
            (w) => w.label === item.weight
          )?.price || 0;

        return {
          productId: item.productId,
          productName: item.product?.name || "Product",
          weight: item.weight,
          price,
          quantity: item.quantity,
        };
      });

      const shippingAddress = `
        ${formData.name},
        ${formData.address},
        ${formData.city} - ${formData.pincode}
        Mobile: ${formData.mobile}
      `;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          totalAmount: total,
          paymentMethod: "Cash on Delivery",
          shippingAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        toast.success("Order placed successfully!");
        router.push("/account");
      } else {
        console.error(data);
        toast.error(data.error || "Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while placing your order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No items in cart
        </h1>
        <p className="text-gray-600">Add some products before checkout</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Any special instructions for your order"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isProcessing || cart.length === 0}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Place Order - ₹${total}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => {
                  const price =
                    item.product?.weights?.find(
                      (w) => w.label === item.weight
                    )?.price || 0;
                  return (
                    <div
                      key={`${item.productId}-${item.weight}`}
                      className="flex items-center space-x-3"
                    >
                      <div className="relative w-12 h-12">
                        <Image
                          src={
                            item.product?.image || "/placeholder.svg"
                          }
                          alt={
                            item.product?.name || "Product"
                          }
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.product?.name || "Product"}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{price * item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span
                    className={shipping === 0 ? "text-emerald-600" : ""}
                  >
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>🔒 Secure checkout with SSL encryption</p>
                <p>💳 Cash on Delivery available</p>
                <p>📞 24/7 customer support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
