"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";

/** Row from public.users table (created by DB trigger on auth signup) */
export interface DbUser {
  id: string;
  auth_uid: string;
  role: "customer" | "seller" | "admin";
  admin_level?: "super_admin" | "admin" | null;
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
  /** Refetch dbUser + reload the Supabase user (after profile updates) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  dbUser: null,
  loading: true,
  getToken: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

/**
 * Determine the "portal context" of the current page.
 * Returns which portal the user is currently viewing.
 */
function getCurrentPortalContext(): "admin" | "seller" | "support" | "customer" {
  if (typeof window === "undefined") return "customer";
  const path = window.location.pathname;
  const host = window.location.hostname;

  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/support")) return "support";
  if (host.startsWith("seller.") || path.startsWith("/seller")) return "seller";
  return "customer";
}

/**
 * Read the `portal` cookie to know which portal the user LOGGED INTO.
 */
function getPortalCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(^| )portal=([^;]+)/);
  return match ? match[2] : null;
}

/**
 * Check if a Supabase session should be suppressed for the current portal.
 *
 * When a user logs into the seller portal, a Supabase session is stored in
 * localStorage (shared across all subdomains). If they then visit the customer
 * portal, we must NOT expose that session — otherwise customer components fire
 * API calls with the seller's token, causing 401 errors.
 *
 * Returns true if the session should be HIDDEN from the current portal context.
 */
export function shouldSuppressSession(): boolean {
  if (typeof window === "undefined") return false;
  const portalContext = getCurrentPortalContext();
  const portalCookie = getPortalCookie();

  // No cookie = no previous login, don't suppress (let login flows work)
  if (!portalCookie) return false;

  // If we're on the customer portal but logged in as seller/admin → suppress
  if (portalContext === "customer" && (portalCookie === "seller" || portalCookie === "admin")) {
    return true;
  }

  // If we're on the seller portal but logged in as admin → suppress
  if (portalContext === "seller" && portalCookie === "admin") {
    return true;
  }

  return false;
}

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
    const portalCookie = getPortalCookie();

    const isSellerHost = window.location.hostname.startsWith("seller.");
    const isSellerPath = window.location.pathname.startsWith("/seller");

    if (authUser) {
      if (isAdminPage || portalCookie === "admin") return;
      if (portalCookie === "seller" || isSellerHost || isSellerPath) return;
    }

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
      // P0 FIX: If session exists but belongs to a different portal context,
      // suppress it so customer components don't fire 401 API calls.
      if (s?.user && shouldSuppressSession()) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

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
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, s: Session | null) => {
      // P0 FIX: Suppress cross-portal sessions
      if (s?.user && shouldSuppressSession()) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        setCookies(s.user);
        // P2 FIX: Only fetch dbUser on meaningful events, not token refreshes.
        // TOKEN_REFRESHED fires every ~60 min and doesn't change the user record.
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          fetchDbUser(s.user.id);
        }
      } else {
        setCookies(null);
        setDbUser(null);
        // Clear stale brand context when user signs out so the next
        // login doesn't inherit a brand belonging to a different seller.
        localStorage.removeItem('anga_active_brand_id');
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchDbUser, setCookies]);

  const getToken = useCallback(async (): Promise<string | null> => {
    // P0 FIX: Don't return tokens for cross-portal sessions
    if (shouldSuppressSession()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const logout = useCallback(async () => {
    // Clear local state FIRST to prevent stale data on next login.
    localStorage.removeItem('anga_active_brand_id');
    setCookies(null);
    
    // We MUST await signOut() before navigating away.
    // If we navigate first, the browser cancels the request and leaves the auth token
    // in local storage. This causes the next page load to have a hydration mismatch 
    // (server sees no cookies = logged out, client sees local storage = logged in).
    await supabase.auth.signOut();
    
    // Now redirect securely
    window.location.href = "/";
  }, [supabase, setCookies]);

  /**
   * Refresh both the Supabase auth user (picks up email/phone/new_email after
   * verification) and the dbUser row. Call after a profile save, OTP verify,
   * or any flow that mutates auth.users.
   */
  const refreshUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return;
    setUser(data.user);
    setCookies(data.user);
    await fetchDbUser(data.user.id);
  }, [supabase, fetchDbUser, setCookies]);

  return (
    <AuthContext.Provider value={{ user, session, dbUser, loading, getToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
