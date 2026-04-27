"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

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
  isGuest: boolean;
  addItem(productId: string, qty?: number): Promise<void>;
  updateQty(productId: string, qty: number): Promise<void>;
  removeItem(productId: string): Promise<void>;
  clearCart(): Promise<void>;
  refreshCart(): Promise<void>;
}

const GUEST_SESSION_KEY = "anga9_guest_cart_session";

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

function getGuestSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_SESSION_KEY);
}

function setGuestSessionId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(GUEST_SESSION_KEY, id);
}

function clearGuestSession() {
  if (typeof window !== "undefined") localStorage.removeItem(GUEST_SESSION_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  const isGuest = !user;

  // Merge guest cart into user cart on login
  useEffect(() => {
    if (!user || mergedRef.current) return;
    const sessionId = getGuestSessionId();
    if (!sessionId) return;
    mergedRef.current = true;
    api.post("/api/cart/merge", { sessionId }, { silent: true })
      .then(() => clearGuestSession())
      .catch(() => {});
  }, [user]);

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
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId: string, qty = 1) => {
    if (!user) {
      let sessionId = getGuestSessionId();
      if (!sessionId) {
        const res = await api.post<{ sessionId: string }>("/api/cart/guest", {}, { silent: true });
        if (res?.sessionId) {
          sessionId = res.sessionId;
          setGuestSessionId(sessionId);
        }
      }
      if (sessionId) {
        await api.post("/api/cart/guest/items", { sessionId, productId, qty }, { silent: true });
        toast.success("Added to cart");
      }
      return;
    }
    await api.post<{ count: number }>("/api/cart/items", { productId, qty });
    await refreshCart();
  }, [user, refreshCart]);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    await api.patch<{ count: number }>(`/api/cart/items/${productId}`, { qty });
    await refreshCart();
    toast.success("Cart updated");
  }, [refreshCart]);

  const removeItem = useCallback(async (productId: string) => {
    await api.delete(`/api/cart/items/${productId}`);
    await refreshCart();
    toast.success("Item removed from cart");
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await api.delete("/api/cart");
    setItems([]);
    setCount(0);
  }, []);

  return (
    <CartContext.Provider value={{ items, count, loading, isGuest, addItem, updateQty, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
