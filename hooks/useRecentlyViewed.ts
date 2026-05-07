"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "anga9_recently_viewed";
const MAX_ITEMS = 20;
const EXPIRY_DAYS = 30;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
  viewedAt: number; // timestamp
}

function load(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: RecentlyViewedItem[] = JSON.parse(raw);
    // Filter expired
    const cutoff = Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return items.filter((i) => i.viewedAt > cutoff);
  } catch {
    return [];
  }
}

function save(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Hydrate on mount
  useEffect(() => {
    setItems(load());
  }, []);

  const addItem = useCallback(
    (item: Omit<RecentlyViewedItem, "viewedAt">) => {
      setItems((prev) => {
        // Remove duplicate
        const filtered = prev.filter((i) => i.id !== item.id);
        // Prepend new
        const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
          0,
          MAX_ITEMS
        );
        save(updated);
        return updated;
      });
    },
    []
  );

  return { items, addItem };
}
