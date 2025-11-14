"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Address = {
  fullName: string;
  phone: string;
  pincode: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  isDefault: boolean;
};

type AuthUser =
  | {
      id: string;
      email: string;
      name?: string;
      addresses?: Address[];
    }
  | null;

interface AuthContextType {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  isLoading: boolean;
}

const TOKEN_KEY = "userToken";
export const AUTH_TOKEN_EVENT = "auth-token-changed";

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async (token: string | null, markLoading = true) => {
      if (!isMounted) return;

      if (!token) {
        if (markLoading) setIsLoading(false);
        setUser(null);
        return;
      }

      if (markLoading) setIsLoading(true);

      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          return;
        }

        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth fetch failed:", error);
        setUser(null);
      } finally {
        if (markLoading) setIsLoading(false);
      }
    };

    const initialToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    fetchUser(initialToken, true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== TOKEN_KEY) return;
      const token = event.newValue ?? localStorage.getItem(TOKEN_KEY);
      fetchUser(token, true);
    };

    const handleAuthEvent = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail ?? localStorage.getItem(TOKEN_KEY);
      fetchUser(detail, true);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_TOKEN_EVENT, handleAuthEvent);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_TOKEN_EVENT, handleAuthEvent);
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      setUser,
      isLoading,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
