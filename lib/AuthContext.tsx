"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";

/** Row from public.users table (created by DB trigger on auth signup) */
export interface DbUser {
  id: string;
  auth_uid: string;
  role: "customer" | "seller" | "admin";
  phone?: string;
  email?: string;
  full_name?: string;
  gstin?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  /** Supabase auth user (null if not logged in) */
  user: SupabaseUser | null;
  /** Supabase session (null if not logged in) */
  session: Session | null;
  /** Public.users DB record (null until fetched) */
  dbUser: DbUser | null;
  loading: boolean;
  /** Get Supabase access token for API calls */
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  dbUser: null,
  loading: true,
  getToken: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchDbUser = useCallback(
    async (authUid: string, retries = 2): Promise<void> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_uid", authUid)
        .single();

      if (data) {
        setDbUser(data as DbUser);
      } else if (retries > 0) {
        // Trigger may not have fired yet — retry after short delay
        await new Promise((r) => setTimeout(r, 500));
        return fetchDbUser(authUid, retries - 1);
      } else {
        console.warn("Could not fetch DB user after retries", error);
        setDbUser(null);
      }
    },
    [supabase],
  );

  const setCookies = useCallback((authUser: SupabaseUser | null) => {
    if (typeof window === "undefined") return;

    const isAdminPage = window.location.pathname.startsWith("/admin");
    const portalMatch = document.cookie.match(/(^| )portal=([^;]+)/);
    const currentPortal = portalMatch ? portalMatch[2] : null;

    if (isAdminPage || currentPortal === "admin") return;

    const isSellerHost = window.location.hostname.startsWith("seller.");
    const isSellerPath = window.location.pathname.startsWith("/seller");
    if (currentPortal === "seller" || isSellerHost || isSellerPath) return;

    const hostname = window.location.hostname;
    const domainAttr = hostname.endsWith("anga9.com") ? "; domain=.anga9.com" : "";
    const secureAttr = window.location.protocol === "https:" ? "; secure" : "";
    const baseAttrs = `; path=/; max-age=86400; samesite=lax${domainAttr}${secureAttr}`;
    const expireAttrs = `; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;

    if (authUser) {
      document.cookie = `portal=customer${baseAttrs}`;
      if (authUser.phone) {
        const purePhone = authUser.phone.replace(/[^\d]/g, "").slice(-10);
        document.cookie = `customer_phone=${purePhone}${baseAttrs}`;
      }
      if (authUser.email) {
        document.cookie = `customer_email=${encodeURIComponent(authUser.email)}${baseAttrs}`;
      }
    } else {
      document.cookie = `portal=${expireAttrs}`;
      document.cookie = `customer_phone=${expireAttrs}`;
      document.cookie = `customer_email=${expireAttrs}`;
    }
  }, []);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: Session | null } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setCookies(s.user);
        fetchDbUser(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        setCookies(s.user);
        fetchDbUser(s.user.id);
      } else {
        setCookies(null);
        setDbUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchDbUser, setCookies]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setDbUser(null);
    setCookies(null);
    window.location.href = "/";
  }, [supabase, setCookies]);

  return (
    <AuthContext.Provider value={{ user, session, dbUser, loading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
