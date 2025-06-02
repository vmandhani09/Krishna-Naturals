"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LocalUserContext = createContext<{ localUserId: string }>({ localUserId: "" });

export function LocalUserProvider({ children }: { children: React.ReactNode }) {
  const [localUserId, setLocalUserId] = useState("");

  useEffect(() => {
    const existingUser = localStorage.getItem("localUserId");

    if (!existingUser) {
      const newUserId = `guest-${crypto.randomUUID()}`;
      localStorage.setItem("localUserId", newUserId);
      setLocalUserId(newUserId);
    } else {
      setLocalUserId(existingUser);
    }
  }, []);

  return (
    <LocalUserContext.Provider value={{ localUserId }}>
      {children}
    </LocalUserContext.Provider>
  );
}

export function useLocalUser() {
  return useContext(LocalUserContext);
}