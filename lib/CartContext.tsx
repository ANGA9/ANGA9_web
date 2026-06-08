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
  min_order_qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  loading: boolean;
  isGuest: boolean;
  addItem(productId: string, qty?: number, variantId?: string): Promise<void>;
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
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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

  const addItem = useCallback(async (productId: string, qty = 1, variantId?: string) => {
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
        await api.post("/api/cart/guest/items", { sessionId, productId, qty, variantId }, { silent: true });
        toast.success("Added to cart");
      }
      return;
    }
    await api.post<{ count: number }>("/api/cart/items", { productId, qty, variantId });
    await refreshCart();
  }, [user, refreshCart]);

  // Per-product monotonic sequence for optimistic qty updates. A burst of
  // rapid +/- clicks fires several PATCHes; only the response matching the
  // LATEST local intent may trigger a rollback — stale responses are ignored.
  const qtySeqRef = useRef<Record<string, number>>({});

  const updateQty = useCallback(async (productId: string, qty: number) => {
    // Optimistic: reflect the new qty instantly (Amazon-style), then sync in
    // the background. `count` is distinct-line-items (redis hlen) so qty
    // changes never affect it.
    const seq = (qtySeqRef.current[productId] ?? 0) + 1;
    qtySeqRef.current[productId] = seq;

    let prevQty: number | undefined;
    setItems((cur) =>
      cur.map((it) => {
        if (it.productId !== productId) return it;
        prevQty = it.qty;
        return { ...it, qty };
      }),
    );

    try {
      await api.patch<{ count: number }>(`/api/cart/items/${productId}`, { qty });
    } catch {
      // Only roll back if no newer click superseded this one.
      if (qtySeqRef.current[productId] === seq && prevQty !== undefined) {
        const rollbackQty = prevQty;
        setItems((cur) => cur.map((it) => (it.productId === productId ? { ...it, qty: rollbackQty } : it)));
        toast.error("Couldn't update quantity");
      }
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    // Optimistic: drop the row instantly; restore on failure. The row
    // disappearing IS the feedback — no toast needed on success.
    let removed: CartItem | undefined;
    setItems((cur) => {
      removed = cur.find((it) => it.productId === productId);
      return cur.filter((it) => it.productId !== productId);
    });
    setCount((c) => Math.max(0, c - 1));

    try {
      await api.delete(`/api/cart/items/${productId}`);
    } catch {
      if (removed) {
        const restore = removed;
        setItems((cur) => [...cur, restore]);
        setCount((c) => c + 1);
        toast.error("Couldn't remove item");
      }
    }
  }, []);

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
