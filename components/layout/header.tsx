"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

type UserType = {
  id: string;
  email: string;
};

function useUserFromToken() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
  }, []);

  return user;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart, getCartItemsCount, fetchCart } = useCart();
  const { wishlist } = useWishlist();
  const user = useUserFromToken();

  // Compute the cart count directly from the cart state.
  const cartCount = useMemo(() => getCartItemsCount(), [cart, getCartItemsCount]);

  // One useEffect to fetch cart initially and update it when "cartUpdated" fires.
  useEffect(() => {
    // Initial fetch when the header mounts.
    fetchCart();
    const handleCartUpdate = async () => {
      await fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [fetchCart]);

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "GET", credentials: "include" });
      if (res.ok) {
        // Remove userToken from localStorage
        localStorage.removeItem("userToken");
        // Remove token cookie (set expiry in the past)
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure;";
        localStorage.setItem("refreshUser", Date.now().toString());
        window.location.reload();
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-stone-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top navigation">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Krishna Naturals
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-stone-700 hover:text-emerald-600 hover:border-b-2 hover:border-emerald-300"
                  }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="relative">
              <Button variant="ghost" size="sm" className="relative hover:bg-red-50 hover:text-red-600 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Show user's name if logged in */}
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hover:bg-stone-100 transition-colors">
                  <User className="h-5 w-5 mr-2" /> {user.email}
                </Button>

                {/* Logout button */}
                <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:shadow-lg">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded="false" aria-label="Toggle navigation menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-stone-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-lg ${isActive(item.href) ? "text-emerald-600 bg-emerald-50" : "text-stone-700 hover:text-emerald-600 hover:bg-stone-50"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}