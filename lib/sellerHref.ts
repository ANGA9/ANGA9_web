"use client";

import { useEffect, useState } from "react";

export function isOnSellerSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("seller.");
}

export function sellerHref(href: string, onSubdomain: boolean): string {
  if (!onSubdomain) return href;
  if (!href.startsWith("/seller")) return href;
  const stripped = href.replace(/^\/seller/, "");
  return stripped === "" ? "/" : stripped;
}

export function useSellerSubdomain(): boolean {
  const [onSub, setOnSub] = useState(false);
  useEffect(() => {
    setOnSub(isOnSellerSubdomain());
  }, []);
  return onSub;
}
