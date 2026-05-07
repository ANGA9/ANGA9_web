"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from "react";
import { Heart } from "lucide-react";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import { useLoginSheet } from "./LoginSheetContext";
import toast from "react-hot-toast";

interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  seller_id: string;
  seller_name: string;
  images: string[];
  min_order_qty?: number;
  unit?: string;
  addedAt: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  loading: boolean;
  hasItem(productId: string): boolean;
  toggleItem(productId: string): Promise<void>;
  removeItem(productId: string): Promise<void>;
  clearWishlist(): Promise<void>;
  refreshWishlist(): Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { open: openLoginSheet } = useLoginSheet();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      setCount(0);
      return;
    }
    try {
      setLoading(true);
      const data = await api.get<{ items: WishlistItem[]; count: number }>("/api/wishlist");
      setItems(data.items);
      setCount(data.count);
    } catch {
      // silently fail — wishlist may not be available
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const hasItem = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const toggleItem = useCallback(
    async (productId: string) => {
      if (!user) {
        toast("Login to save items to your wishlist", { icon: createElement(Heart, { size: 18, color: "#DC2626", fill: "#DC2626" }) });
        openLoginSheet();
        return;
      }
      try {
        const data = await api.post<{ message: string; added: boolean; count: number }>(
          "/api/wishlist/items",
          { productId }
        );
        toast.success(data.message);
        await refreshWishlist();
      } catch {
        toast.error("Failed to update wishlist");
      }
    },
    [user, openLoginSheet, refreshWishlist]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      try {
        await api.delete(`/api/wishlist/items/${productId}`);
        toast.success("Removed from wishlist");
        await refreshWishlist();
      } catch {
        toast.error("Failed to remove from wishlist");
      }
    },
    [refreshWishlist]
  );

  const clearWishlist = useCallback(async () => {
    try {
      await api.delete("/api/wishlist");
      setItems([]);
      setCount(0);
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Failed to clear wishlist");
    }
  }, []);

  return (
    <WishlistContext.Provider
      value={{ items, count, loading, hasItem, toggleItem, removeItem, clearWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
