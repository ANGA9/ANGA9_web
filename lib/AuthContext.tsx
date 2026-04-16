"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && currentUser.phoneNumber) {
        // We set the cookie to work symmetrically with proxy.ts
        document.cookie = "portal=customer; path=/; max-age=86400";
        // Clean phone number: remove non-alphanumeric chars
        const purePhone = currentUser.phoneNumber.replace(/[^\d]/g, "").slice(-10);
        document.cookie = "customer_phone=" + purePhone + "; path=/; max-age=86400";
      } else {
        // Clear cookies on sign out
        document.cookie = "portal=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "customer_phone=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
