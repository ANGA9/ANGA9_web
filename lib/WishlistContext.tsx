"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import toast from "react-hot-toast";
import { Product } from "@/components/customer/ProductCard";

interface WishlistContextValue {
  items: Product[];
  count: number;
  hasItem(productId: string): boolean;
  toggleItem(product: Product): void;
  removeItem(productId: string): void;
  clearWishlist(): void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

const WISHLIST_KEY = "anga9_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse wishlist from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const hasItem = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const toggleItem = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  // Separate effect for toasts to prevent double-firing in strict mode
  const initialMount = useRef(true);
  const prevCount = useRef(0);
  
  useEffect(() => {
    // Only fire toasts after the initial load from localStorage is complete
    if (!isLoaded) return;
    
    if (initialMount.current) {
      initialMount.current = false;
      prevCount.current = items.length;
      return;
    }
    
    if (items.length > prevCount.current) {
      toast.success("Added to wishlist");
    } else if (items.length < prevCount.current) {
      toast.success("Removed from wishlist");
    }
    
    prevCount.current = items.length;
  }, [items, isLoaded]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Removed from wishlist");
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
    toast.success("Wishlist cleared");
  }, []);

  return (
    <WishlistContext.Provider value={{ items, count: items.length, hasItem, toggleItem, removeItem, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
