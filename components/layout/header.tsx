"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/userAuth";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const { cart, getCartItemsCount, fetchCart } = useCart();
  const { wishlist } = useWishlist();
  const { user, setUser, isLoading: isAuthLoading } = useAuth();

  const cartCount = useMemo(() => getCartItemsCount(), [cart, getCartItemsCount]);

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = async () => await fetchCart();

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [fetchCart]);

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "GET", credentials: "include" });

      if (res.ok) {
        localStorage.removeItem("userToken");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970; Secure;";

        setUser(null);
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-stone-200">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Top navigation"
      >
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-primary hover:opacity-90 transition-colors"
            >
              Dryfruit Grove
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-stone-700 hover:text-primary hover:border-b-2 hover:border-primary/40"
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-secondary hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Login / User Menu */}
            {!isAuthLoading && (user ? (
              <>
                {/* Username */}
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-stone-100 transition-colors"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Hi, {user.name ?? "there"}
                  </Button>
                </Link>

              </>
            ) : (
              <Link href="/auth/login">
                <Button
                  size="sm"
                  className="bg-primary hover:opacity-90 text-primary-foreground transition-all duration-300 hover:shadow-lg"
                >
                  Login
                </Button>
              </Link>
            ))}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-stone-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-lg ${
                    isActive(item.href)
                      ? "text-primary bg-secondary"
                      : "text-stone-700 hover:text-primary hover:bg-stone-50"
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
