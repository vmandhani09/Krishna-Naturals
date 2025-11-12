"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserType = { id: string; email: string } | null;

type AuthContextType = {
  user: UserType;
  setUser: (user: UserType) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setIsLoading(false));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "userToken") {
        const newToken = localStorage.getItem("userToken");
        if (!newToken) setUser(null);
        else {
          fetch("/api/auth/me", { headers: { Authorization: `Bearer ${newToken}` } })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
              if (data?.user) setUser(data.user);
            });
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
