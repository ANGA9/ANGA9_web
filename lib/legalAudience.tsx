"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export type LegalAudience = "customer" | "seller";

interface LegalAudienceContextValue {
  audience: LegalAudience;
  setAudience: (aud: LegalAudience) => void;
}

const LegalAudienceContext = createContext<LegalAudienceContextValue>({
  audience: "customer",
  setAudience: () => {},
});

export const AUDIENCE_STORAGE_KEY = "anga9.legal_audience";

export function LegalAudienceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [audience, setAudienceState] = useState<LegalAudience>("customer");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const param = params.get("audience") || params.get("role");
      if (param === "seller" || param === "merchant") {
        setAudienceState("seller");
        return;
      }
      if (param === "customer" || param === "buyer") {
        setAudienceState("customer");
        return;
      }

      if (window.location.hostname.startsWith("seller.") || window.location.pathname.startsWith("/seller")) {
        setAudienceState("seller");
        return;
      }

      const stored = localStorage.getItem(AUDIENCE_STORAGE_KEY);
      if (stored === "seller" || stored === "customer") {
        setAudienceState(stored);
      }
    }
  }, [pathname]);

  const setAudience = (newAudience: LegalAudience) => {
    setAudienceState(newAudience);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUDIENCE_STORAGE_KEY, newAudience);

      const params = new URLSearchParams(window.location.search);
      if (newAudience === "seller") {
        params.set("audience", "seller");
      } else {
        params.delete("audience");
        params.delete("role");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    }
  };

  return (
    <LegalAudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </LegalAudienceContext.Provider>
  );
}

export function useLegalAudience() {
  return useContext(LegalAudienceContext);
}
