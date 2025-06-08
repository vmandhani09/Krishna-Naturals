"use client";
import { useState, useEffect } from "react";
import { syncLocalDataToDB } from "@/lib/syncLocalData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist";



export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const { syncLocalCartToDB } = useCart();
  const { syncLocalWishlistToDB } = useWishlist();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null); // ✅ Track logged-in user state

  useEffect(() => {
    async function syncWishlist() {
      const localWishlist = localStorage.getItem("wishlist");
      if (!localWishlist) return;

      try {
        const productIds = JSON.parse(localWishlist);
        if (!Array.isArray(productIds) || productIds.length === 0) return;

        const response = await fetch("/api/user/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });

        if (response.ok) {
          localStorage.removeItem("wishlist"); // Clear local wishlist after sync
          const data = await response.json();
          console.log("Wishlist synced:", data.wishlist);
        } else {
          console.error("Wishlist sync failed");
        }
      } catch (error) {
        console.error("Error syncing wishlist:", error);
      }
    }

    if (user) {
      syncWishlist();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!response.ok) {
        alert("Login failed. Please try again.");
        return;
      }

      const result = await response.json();

      if (result.token) {
        document.cookie = `token=${result.token}; path=/; Secure;`; // ✅ Store token in cookie
        localStorage.setItem("userToken", result.token); // ✅ Store token in localStorage

        setUser(result.user);
        await syncLocalCartToDB(result.tolen);
        await syncLocalWishlistToDB(result.token);
        router.push("/home");
      } else {
        alert(result.error || "Invalid credential");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">Krishna Naturals</h1>
          <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link href="#" className="text-sm text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-emerald-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-emerald-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-emerald-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}