"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { getSupabaseBrowserClient } from "./supabase";

interface Brand {
  id: string;
  role: string;
  full_name: string;
  seller_profiles?: {
    store_name: string;
    logo_url?: string;
  };
}

interface BrandContextType {
  activeBrandId: string | null;
  brands: Brand[];
  isLoading: boolean;
  setActiveBrandId: (id: string) => void;
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// Listen to storage events so tabs sync active brand
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "anga_active_brand_id") {
      // Just dispatch a custom event that our context can listen to
      window.dispatchEvent(new Event("brand_change"));
    }
  });
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      // Don't call the API if there's no session — prevents 401 errors
      // in the console after logout or for unauthenticated visitors.
      const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
      if (!session) {
        setBrands([]);
        setIsLoading(false);
        return;
      }

      const res = await api.get<{ brands: Brand[] }>("/api/users/brands", { silent: true });
      if (res && res.brands) {
        setBrands(res.brands);

        const stored = typeof window !== "undefined" ? localStorage.getItem("anga_active_brand_id") : null;
        if (stored) {
          const ownsIt = res.brands.some((b) => b.id === stored);
          if (!ownsIt) {
            const fallback = res.brands[0]?.id || null;
            if (fallback) localStorage.setItem("anga_active_brand_id", fallback);
            else localStorage.removeItem("anga_active_brand_id");
            setActiveBrandIdState(fallback);
          } else {
            setActiveBrandIdState(stored);
          }
        } else if (res.brands.length > 0) {
          const primaryId = res.brands[0].id;
          localStorage.setItem("anga_active_brand_id", primaryId);
          setActiveBrandIdState(primaryId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch brands", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBrands();

    // Check local storage
    const stored = localStorage.getItem("anga_active_brand_id");
    if (stored) {
      setActiveBrandIdState(stored);
    }

    // Sync across tabs or same-tab manual changes
    const onBrandChange = () => {
      const updated = localStorage.getItem("anga_active_brand_id");
      if (updated !== activeBrandId) {
        setActiveBrandIdState(updated);
      }
    };

    window.addEventListener("brand_change", onBrandChange);
    return () => window.removeEventListener("brand_change", onBrandChange);
  }, [activeBrandId]);

  const setActiveBrandId = (id: string) => {
    localStorage.setItem("anga_active_brand_id", id);
    setActiveBrandIdState(id);
    window.dispatchEvent(new Event("brand_change"));
    
    // Reload the page to ensure all state is cleanly re-fetched with the new brand
    window.location.reload();
  };

  return (
    <BrandContext.Provider value={{ activeBrandId, brands, isLoading, setActiveBrandId, refreshBrands: fetchBrands }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
