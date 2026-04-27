"use client";

import { useEffect, useState, useRef } from "react";
import {
  Home,
  Cpu,
  ShoppingBag,
  Factory,
  Armchair,
  Briefcase,
  ArrowUp,
  ShieldCheck,
  Truck,
} from "lucide-react";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import SearchFilterStrip from "@/components/customer/SearchFilterStrip";
import { api } from "@/lib/api";

const categoryIcons = [
  { name: "Home Decor", icon: Home },
  { name: "Electronics", icon: Cpu },
  { name: "Retail", icon: ShoppingBag },
  { name: "Industrial", icon: Factory },
  { name: "Furniture", icon: Armchair },
  { name: "Office Essentials", icon: Briefcase },
];

/** Shape returned by GET /api/products */
interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  seller_id: string;
  category_id?: string;
  description?: string;
  base_price: number;
  sale_price?: number | null;
  min_order_qty: number;
  unit: string;
  status: string;
  images: string[];
  tags: string[];
  created_at: string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

/** Map API product to ProductCard's expected shape */
function toCardProduct(p: ApiProduct, categoryName?: string): Product {
  return {
    id: p.id,
    name: p.name,
    seller: "", // seller name not available in list response
    category: categoryName || "",
    originalPrice: p.base_price,
    price: p.sale_price ?? p.base_price,
    minOrder: `${p.min_order_qty} ${p.unit}${p.min_order_qty > 1 ? "s" : ""}`,
    badge: undefined,
  };
}

export default function CustomerHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortParam, setSortParam] = useState("newest");
  const [categoryParam, setCategoryParam] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const hasActiveFilters = !!categoryParam;

  const updateFilters = (updates: Record<string, string>) => {
    if (updates.sort !== undefined) setSortParam(updates.sort);
    if (updates.category !== undefined) setCategoryParam(updates.category);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    async function fetchInitial() {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("status", "active");
        queryParams.set("limit", "12");
        queryParams.set("page", "1");
        queryParams.set("sort_by", sortParam);
        if (categoryParam) queryParams.set("category", categoryParam);

        // Fetch products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          api.get<{ data: ApiProduct[]; total: number }>(
            `/api/products?${queryParams.toString()}`
          ),
          api.get<{ categories: ApiCategory[] } | ApiCategory[]>("/api/categories").catch(() => ({ categories: [] })),
        ]);

        if (cancelled) return;

        // Build category lookup
        const catMap = new Map<string, string>();
        const rawCats = categoriesRes;
        const cats = Array.isArray(rawCats) ? rawCats : (rawCats as { categories: ApiCategory[] })?.categories ?? [];
        for (const c of cats) {
          catMap.set(c.id, c.name);
        }

        const items = productsRes?.data ?? [];
        const mapped = items.map((p) =>
          toCardProduct(p, p.category_id ? catMap.get(p.category_id) : undefined)
        );
        
        // Final safety check: remove duplicates within the same batch
        const seen = new Set();
        const uniqueMapped = mapped.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        setProducts(uniqueMapped);
        if (items.length < 12) setHasMore(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInitial();
    return () => { cancelled = true; };
  }, [sortParam, categoryParam]);

  const isFetchingRef = useRef(false);

  const loadMore = async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const queryParams = new URLSearchParams();
      queryParams.set("status", "active");
      queryParams.set("limit", "12");
      queryParams.set("page", nextPage.toString());
      queryParams.set("sort_by", sortParam);
      if (categoryParam) queryParams.set("category", categoryParam);

      const [productsRes, categoriesRes] = await Promise.all([
        api.get<{ data: ApiProduct[]; total: number }>(
          `/api/products?${queryParams.toString()}`
        ),
        api.get<{ categories: ApiCategory[] } | ApiCategory[]>("/api/categories").catch(() => ({ categories: [] })),
      ]);

      const catMap = new Map<string, string>();
      const rawCats = categoriesRes;
      const cats = Array.isArray(rawCats) ? rawCats : (rawCats as { categories: ApiCategory[] })?.categories ?? [];
      for (const c of cats) {
        catMap.set(c.id, c.name);
      }

      const items = productsRes?.data ?? [];
      const mapped = items.map((p) =>
        toCardProduct(p, p.category_id ? catMap.get(p.category_id) : undefined)
      );
      
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProducts = mapped.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
      
      setPage(nextPage);
      if (items.length < 12) setHasMore(false);
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // 800px from bottom triggers next fetch early for a smoother experience
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        if (!loading && !isFetchingRef.current && hasMore) {
          loadMore();
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page, sortParam, categoryParam]);

  return (
    <div className="py-2 md:py-6">
      {/* ══════════ DESKTOP USP TRUST BAR ══════════ */}
      <div className="hidden md:flex justify-between items-center bg-[#F8FBFF] border border-[#EAF2FF] rounded-xl px-6 py-3 mb-6 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[#1A6FD4] font-bold text-sm">✓ ANGA9 Verified Sellers</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#1A6FD4]" /> 100% Secure Payments</span>
          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#1A6FD4]" /> Pan-India Delivery</span>
          <span className="flex items-center gap-1.5"><Factory className="w-4 h-4 text-[#1A6FD4]" /> Direct Wholesale Pricing</span>
        </div>
      </div>

      {/* Hero */}
      <HeroBanner />

      {/* Shop by Category */}
      <section style={{ marginTop: 40 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: '24px' }}
          >
            Shop by category
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: '14px' }}
          >
            View All
          </button>
        </div>
        <div
          className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-6 no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0"
          style={{ gap: 12, scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryIcons.map((cat) => (
            <button
              key={cat.name}
              className="flex-shrink-0 snap-center w-[100px] md:w-auto flex flex-col items-center border cursor-pointer transition-all duration-150 hover:border-[#1A6FD4] hover:scale-[1.03]"
              style={{
                background: "#FFFFFF",
                borderColor: "#E8EEF4",
                borderRadius: 16,
                padding: "20px 8px",
                textAlign: "center",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full transition-colors duration-150"
                style={{
                  width: 52,
                  height: 52,
                  background: "#EAF2FF",
                  marginBottom: 10,
                }}
              >
                <cat.icon
                  style={{ width: 22, height: 22, color: "#1A6FD4" }}
                />
              </div>
              <span
                className="font-medium text-center leading-snug"
                style={{ color: "#1A1A2E", fontSize: '13px' }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Products */}
      <section style={{ marginTop: 48 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2
            className="font-bold"
            style={{ color: "#1A1A2E", fontSize: '24px' }}
          >
            Trending Now
          </h2>
          <button
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: "#1A6FD4", fontSize: '14px' }}
          >
            View All
          </button>
        </div>

        <div className="mb-4 md:mb-6">
          <SearchFilterStrip 
            sortParam={sortParam} 
            categoryParam={categoryParam} 
            hasActiveFilters={hasActiveFilters} 
            updateUrl={updateFilters} 
            renderDesktopSidebar={() => null}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border"
                style={{ background: "#F3F4F6", borderColor: "#E8EEF4", height: 340 }}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {loadingMore && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="flex space-x-2 justify-center items-center">
                  <div className="h-3 w-3 bg-[#1A6FD4] rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                  <div className="h-3 w-3 bg-[#1A6FD4] rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                  <div className="h-3 w-3 bg-[#1A6FD4] rounded-full animate-bounce"></div>
                </div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                  Finding more wonderful things for you...
                </p>
              </div>
            )}
            
            {!hasMore && products.length > 0 && (
              <p className="text-center py-12 text-sm font-medium text-gray-400">
                You've seen everything we have for now! Check back later.
              </p>
            )}
          </>
        ) : (
          <p className="text-center py-12" style={{ color: "#9CA3AF" }}>
            No products available yet.
          </p>
        )}
      </section>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-5 z-50 p-3 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 text-gray-700 hover:text-[#1A6FD4] hover:bg-blue-50 transition-all animate-in fade-in slide-in-from-bottom-5"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
