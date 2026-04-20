"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";

/** Supabase user record returned by auth-service /verify */
export interface DbUser {
  id: string;
  firebase_uid: string;
  role: "customer" | "seller" | "admin";
  phone?: string;
  email?: string;
  full_name?: string;
}

interface AuthContextType {
  /** Firebase user (null if not logged in) */
  user: User | null;
  /** Supabase user record (null until synced with backend) */
  dbUser: DbUser | null;
  loading: boolean;
  /** Get a fresh Firebase ID token for API calls */
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  getToken: async () => null,
  logout: async () => {},
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }, []);

  /** Sync Firebase user with Supabase via auth-service */
  const syncDbUser = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user ?? data);
      } else {
        // Auth service not available yet — clear dbUser silently
        console.warn("Auth service unavailable, skipping DB sync");
        setDbUser(null);
      }
    } catch {
      // Backend not running — expected during early development
      console.warn("Could not reach auth service for DB sync");
      setDbUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser && currentUser.phoneNumber) {
        // Set cookies for portal routing
        document.cookie = "portal=customer; path=/; max-age=86400";
        const purePhone = currentUser.phoneNumber.replace(/[^\d]/g, "").slice(-10);
        document.cookie = "customer_phone=" + purePhone + "; path=/; max-age=86400";

        // Sync with backend DB
        await syncDbUser(currentUser);
      } else {
        // Clear state on sign out
        document.cookie = "portal=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "customer_phone=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setDbUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncDbUser]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setDbUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
