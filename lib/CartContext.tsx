"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext";

interface CartItem {
  productId: string;
  variantId?: string;
  qty: number;
  addedAt: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number | null;
  seller_id: string;
  images: string[];
  unit: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  loading: boolean;
  addItem(productId: string, qty?: number): Promise<void>;
  updateQty(productId: string, qty: number): Promise<void>;
  removeItem(productId: string): Promise<void>;
  clearCart(): Promise<void>;
  refreshCart(): Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setCount(0);
      return;
    }
    try {
      setLoading(true);
      const data = await api.get<{ items: CartItem[]; count: number }>("/api/cart");
      setItems(data.items);
      setCount(data.count);
    } catch {
      // silently fail — cart may not be available
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId: string, qty = 1) => {
    await api.post<{ count: number }>("/api/cart/items", { productId, qty });
    await refreshCart();
  }, [refreshCart]);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    await api.patch<{ count: number }>(`/api/cart/items/${productId}`, { qty });
    await refreshCart();
  }, [refreshCart]);

  const removeItem = useCallback(async (productId: string) => {
    await api.delete(`/api/cart/items/${productId}`);
    await refreshCart();
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await api.delete("/api/cart");
    setItems([]);
    setCount(0);
  }, []);

  return (
    <CartContext.Provider value={{ items, count, loading, addItem, updateQty, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
