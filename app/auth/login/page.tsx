"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth, AUTH_TOKEN_EVENT } from "@/hooks/userAuth";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { syncLocalCartToDB } = useCart();
  const { syncLocalWishlistToDB } = useWishlist();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("verified") === "true") {
      setSuccessMessage("Email verified successfully! You can now login.");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const token = data.token;

      // ===========================
      // STORE JWT IN BOTH PLACES
      // ===========================
      localStorage.setItem("userToken", token);
      document.cookie = `token=${token}; path=/; SameSite=Lax;`;

      // ===========================
      // UPDATE AUTH STATE
      // ===========================
      setUser(data.user);
      window.dispatchEvent(
        new CustomEvent(AUTH_TOKEN_EVENT, { detail: token }),
      );

      // SYNC CART + WISHLIST
      await syncLocalCartToDB(token);
      await syncLocalWishlistToDB(token);

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">Dryfruit Grove</h1>
          <p className="text-gray-600 mt-2">Welcome back!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* 🔥 Forgot Password + Remember Me section restored */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="rememberMe">Remember me</Label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Forgot Password?
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
                  Don’t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
