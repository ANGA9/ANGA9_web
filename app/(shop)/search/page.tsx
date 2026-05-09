"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import EmptyState from "@/components/shared/EmptyState";

/* ─── Types ─── */
interface SearchProduct {
  id: string; name: string; slug: string; seller_id: string;
  category_id?: string; description?: string; base_price: number;
  sale_price?: number | null; min_order_qty: number; unit: string;
  status: string; images: string[]; tags: string[];
  category_name?: string; seller_name?: string;
}
interface SearchFilters {
  categories: { name: string; count: number }[];
  price_range: { min: number; max: number };
  sellers: { name: string; count: number }[];
}
interface SearchResponse {
  data: SearchProduct[]; total: number; page: number;
  limit: number; totalPages: number;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "ratings", label: "Top Rated" },
  { value: "discount", label: "Best Discount" },
];

const ACCENT = "#4338CA";
const BOTTOM_NAV_H = "calc(56px + env(safe-area-inset-bottom, 0px))";

function toCardProduct(p: SearchProduct): Product {
  return {
    id: p.id, name: p.name, seller: p.seller_name || "",
    category: p.category_name || "",
    originalPrice: p.base_price,
    price: p.sale_price ?? p.base_price,
    minOrder: p.min_order_qty ? `${p.min_order_qty} ${p.unit || "unit"}${p.min_order_qty > 1 ? "s" : ""}` : "Not specified",
    imageUrl: p.images?.[0] || undefined,
  };
}

type SheetKind = "sort" | "filters" | null;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const sortParam = searchParams.get("sort") || "relevance";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters | null>(null);

  // Sheet state
  const [activeSheet, setActiveSheet] = useState<SheetKind>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [draftSort, setDraftSort] = useState(sortParam);

  // Desktop filter state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ price: true, sellers: false });
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value); else params.delete(key);
      }
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Fetch results
  useEffect(() => {
    let cancelled = false;
    async function fetchResults() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (categoryParam) params.set("category", categoryParam);
        if (sortParam && sortParam !== "relevance") params.set("sort", sortParam);
        if (minPriceParam) params.set("minPrice", minPriceParam);
        if (maxPriceParam) params.set("maxPrice", maxPriceParam);
        params.set("page", String(pageParam));
        params.set("limit", "12");
        const [searchRes, filtersRes] = await Promise.all([
          api.get<SearchResponse>(`/api/search?${params.toString()}`),
          filters ? Promise.resolve(filters) : api.get<SearchFilters>("/api/search/filters", { silent: true }),
        ]);
        if (cancelled) return;
        setProducts((searchRes?.data ?? []).map(toCardProduct));
        setTotal(searchRes?.total ?? 0);
        setTotalPages(searchRes?.totalPages ?? 0);
        if (filtersRes && !filters) setFilters(filtersRes);
      } catch {
        if (!cancelled) { setProducts([]); setTotal(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResults();
    return () => { cancelled = true; };
  }, [query, categoryParam, sortParam, minPriceParam, maxPriceParam, pageParam, filters]);

  // Sheet helpers
  const openSheet = (kind: SheetKind) => {
    setIsClosing(false);
    if (kind === "sort") setDraftSort(sortParam || "relevance");
    setActiveSheet(kind);
  };
  const closeSheet = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => { setActiveSheet(null); setIsClosing(false); }, 240);
  };

  // Lock body scroll when sheet open
  useEffect(() => {
    if (!activeSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [activeSheet]);

  const applySort = () => { updateUrl({ sort: draftSort }); closeSheet(); };
  const applyPrice = () => { updateUrl({ minPrice: localMinPrice, maxPrice: localMaxPrice }); };
  const toggleSection = (s: string) => setExpandedSections((p) => ({ ...p, [s]: !p[s] }));
  const hasActiveFilters = !!(categoryParam || minPriceParam || maxPriceParam);
  const clearAllFilters = () => { router.push(`/search?q=${encodeURIComponent(query)}`); setLocalMinPrice(""); setLocalMaxPrice(""); };

  const sheetAnim = isClosing ? "srch-sheet-out" : "srch-sheet-in";
  const overlayAnim = isClosing ? "srch-overlay-out" : "srch-overlay-in";

  /* ── Filter content (reused in desktop sidebar + mobile sheet) ── */
  const FilterContent = () => (
    <div className="space-y-5">
      {/* ── Price Range ── */}
      <div>
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full mb-3">
          <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>Price Range</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" style={{ color: t.textMuted }} /> : <ChevronDown className="w-4 h-4" style={{ color: t.textMuted }} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/10" style={{ borderColor: t.border }} />
              <span className="text-sm shrink-0" style={{ color: t.textMuted }}>to</span>
              <input type="number" placeholder="Max" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/10" style={{ borderColor: t.border }} />
            </div>
            <button onClick={applyPrice} className="w-full h-9 rounded-xl text-xs font-bold transition-colors hover:opacity-90" style={{ background: "#EEF2FF", color: ACCENT }}>Apply</button>
          </div>
        )}
      </div>

      {/* ── Sellers ── */}
      {filters?.sellers && filters.sellers.length > 0 && (
        <div className="border-t pt-4" style={{ borderColor: t.border }}>
          <button onClick={() => toggleSection("sellers")} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold" style={{ color: t.textPrimary }}>Sellers</span>
            {expandedSections.sellers ? <ChevronUp className="w-4 h-4" style={{ color: t.textMuted }} /> : <ChevronDown className="w-4 h-4" style={{ color: t.textMuted }} />}
          </button>
          {expandedSections.sellers && (
            <div className="space-y-1">
              {filters.sellers.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-2 px-3">
                  <span className="text-sm" style={{ color: t.textSecondary }}>{s.name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: t.textMuted }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Sheet animations ── */}
      <style>{`
        @keyframes srchSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes srchSlideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes srchOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes srchOverlayOut { from { opacity: 1; } to { opacity: 0; } }
        .srch-sheet-in { animation: srchSlideUp 260ms cubic-bezier(0.22,1,0.36,1); }
        .srch-sheet-out { animation: srchSlideDown 220ms ease-in forwards; }
        .srch-overlay-in { animation: srchOverlayIn 200ms ease-out; }
        .srch-overlay-out { animation: srchOverlayOut 200ms ease-in forwards; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Mobile slim header (back + logo + query + actions) ── */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b" style={{ borderColor: t.border }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            aria-label="Back to explore"
            onClick={() => router.push("/search/explore")}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: t.textPrimary }} />
          </button>

          <div className="shrink-0 w-7 h-7 rounded-md overflow-hidden flex items-center justify-center bg-white">
            <Image src="/favicon.ico" alt="Anga9" width={28} height={28} className="object-contain" />
          </div>

          <h1
            className="flex-1 min-w-0 truncate uppercase tracking-[0.14em] text-[12px] font-medium"
            style={{ color: t.textSecondary, fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto" }}
            title={query}
          >
            {query || "All products"}
          </h1>

          <div className="shrink-0 flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => router.push("/search/explore")}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-[20px] h-[20px] text-[#4B5563]" />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className="w-[20px] h-[20px] text-[#4B5563]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold bg-[#4338CA] text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-[20px] h-[20px] text-[#4B5563]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold bg-[#4338CA] text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="pb-[calc(56px+env(safe-area-inset-bottom,0px)+16px)] md:pb-6 md:py-8">
        {/* ── Results header bar ── */}
        <div className="px-4 md:px-0 pt-3 md:pt-0 pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="hidden md:block font-bold text-[17px] md:text-[22px] tracking-tight" style={{ color: t.textPrimary }}>
                {query ? `Results for "${query}"` : "All Products"}
              </h1>
              {!loading && (
                <span className="text-[12px] md:text-[13px] font-semibold px-3 py-1 rounded-full" style={{ background: "#EEF2FF", color: ACCENT }}>
                  {total} found
                </span>
              )}
            </div>

            {/* Desktop sort pills */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl border" style={{ borderColor: t.border, background: "#FAFAFA" }}>
              {SORT_OPTIONS.slice(0, 4).map((o) => (
                <button key={o.value} onClick={() => updateUrl({ sort: o.value })}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: sortParam === o.value ? ACCENT : "transparent",
                    color: sortParam === o.value ? "#FFF" : t.textSecondary,
                    boxShadow: sortParam === o.value ? "0 1px 4px rgba(67,56,202,0.3)" : "none",
                  }}>
                  {o.label}
                </button>
              ))}
              <select value={sortParam} onChange={(e) => updateUrl({ sort: e.target.value })}
                className="px-2 py-1.5 rounded-lg text-[13px] font-semibold outline-none bg-transparent cursor-pointer"
                style={{ color: t.textMuted }}>
                <option value="" disabled>More…</option>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips (both mobile & desktop) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {categoryParam && (
                <button onClick={() => updateUrl({ category: "" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:shadow-sm"
                  style={{ background: "#EEF2FF", color: ACCENT }}>
                  {categoryParam}
                  <X className="w-3 h-3" />
                </button>
              )}
              {(minPriceParam || maxPriceParam) && (
                <button onClick={() => { updateUrl({ minPrice: "", maxPrice: "" }); setLocalMinPrice(""); setLocalMaxPrice(""); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:shadow-sm"
                  style={{ background: "#EEF2FF", color: ACCENT }}>
                  ₹{minPriceParam || "0"} – ₹{maxPriceParam || "∞"}
                  <X className="w-3 h-3" />
                </button>
              )}
              <button onClick={clearAllFilters} className="text-[12px] font-semibold ml-1 hover:underline" style={{ color: t.textMuted }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Sort/Filter bar ── */}
        <div className="md:hidden sticky top-[56px] z-30 px-3 pb-2 pt-1 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <button onClick={() => openSheet("sort")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold border-r border-gray-100 active:bg-gray-50 transition-colors"
              style={{ color: t.textPrimary }}>
              <ArrowUpDown className="w-4 h-4" style={{ color: t.textSecondary }} />
              Sort
            </button>
            <button onClick={() => openSheet("filters")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold active:bg-gray-50 transition-colors relative"
              style={{ color: t.textPrimary }}>
              <SlidersHorizontal className="w-4 h-4" style={{ color: t.textSecondary }} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full absolute top-2.5 right-[calc(50%-28px)]" style={{ background: ACCENT }} />
              )}
            </button>
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="flex gap-6 lg:gap-8 px-0 md:px-0">
          {/* Desktop Sidebar */}
          <div className="hidden md:block shrink-0" style={{ width: 260 }}>
            <div className="sticky top-[160px] rounded-2xl border p-5 shadow-sm" style={{ borderColor: t.border, background: "#FAFBFC" }}>
              {/* Sidebar header */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: t.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
                    <SlidersHorizontal className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="font-bold text-[15px]" style={{ color: t.textPrimary }}>Filters</h3>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-[12px] font-bold hover:underline" style={{ color: ACCENT }}>Clear all</button>
                )}
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 md:gap-5 px-1.5 md:px-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border" style={{ background: "#F3F4F6", borderColor: t.border, height: 320 }} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 md:gap-5 px-1.5 md:px-0">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 mb-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", String(page));
                        router.push(`/search?${params.toString()}`);
                      }}
                        className="w-10 h-10 rounded-xl text-sm font-semibold transition-all hover:shadow-sm"
                        style={{
                          background: page === pageParam ? ACCENT : "transparent",
                          color: page === pageParam ? "#FFF" : t.textSecondary,
                          border: page === pageParam ? "none" : `1px solid ${t.border}`,
                        }}>
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon={Search} title="No products found"
                description={query ? `We couldn't find any products matching "${query}". Try different keywords or filters.` : "No products match the current filters."}
                actionLabel="Clear Filters" onAction={clearAllFilters} accentColor={ACCENT} />
            )}
          </div>
        </div>
      </div>

      {/* ══════ SORT BOTTOM SHEET ══════ */}
      {activeSheet === "sort" && (
        <div className="fixed inset-0 z-[9998] flex flex-col justify-end md:justify-center md:items-center">
          <div className={`absolute inset-0 bg-black/40 ${overlayAnim}`} onClick={closeSheet} />
          <div className={`relative bg-white rounded-t-3xl md:rounded-2xl flex flex-col w-full md:w-[400px] ${sheetAnim}`}
            style={{ marginBottom: BOTTOM_NAV_H, boxShadow: "0 -4px 24px rgba(0,0,0,0.1)" }}>
            {/* Grabber */}
            <div className="md:hidden flex justify-center pt-3 pb-1"><span className="block w-10 h-1 rounded-full bg-gray-300" /></div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[15px] uppercase tracking-wide" style={{ color: t.textPrimary }}>Sort By</h3>
              <button onClick={closeSheet} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {/* Options */}
            <div className="p-2 overflow-y-auto overscroll-contain">
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setDraftSort(opt.value)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-medium hover:bg-gray-50 transition-colors"
                  style={{ color: draftSort === opt.value ? ACCENT : t.textPrimary, fontWeight: draftSort === opt.value ? 700 : 500 }}>
                  {opt.label}
                  <div className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{ borderColor: draftSort === opt.value ? ACCENT : "#D1D5DB" }}>
                    {draftSort === opt.value && <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />}
                  </div>
                </button>
              ))}
            </div>
            {/* Apply */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl md:rounded-b-2xl">
              <button onClick={applySort}
                className="w-full py-3 rounded-xl text-white font-bold text-[14px] shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: ACCENT }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ FILTERS BOTTOM SHEET ══════ */}
      {activeSheet === "filters" && (
        <div className="fixed inset-0 z-[9998] flex flex-col justify-end md:justify-center md:items-center">
          <div className={`absolute inset-0 bg-black/40 ${overlayAnim}`} onClick={closeSheet} />
          <div className={`relative bg-white rounded-t-3xl md:rounded-2xl flex flex-col max-h-[80dvh] w-full md:w-[440px] ${sheetAnim}`}
            style={{ marginBottom: BOTTOM_NAV_H, boxShadow: "0 -4px 24px rgba(0,0,0,0.1)" }}>
            {/* Grabber */}
            <div className="md:hidden flex justify-center pt-3 pb-1"><span className="block w-10 h-1 rounded-full bg-gray-300" /></div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[15px] uppercase tracking-wide" style={{ color: t.textPrimary }}>Filters</h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-[12px] font-bold" style={{ color: ACCENT }}>Clear all</button>
                )}
                <button onClick={closeSheet} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            {/* Filter content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5">
              <FilterContent />
            </div>
            {/* Apply */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl md:rounded-b-2xl flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: t.textMuted }}>
                {total.toLocaleString()}+ products
              </span>
              <button onClick={closeSheet}
                className="px-8 py-2.5 rounded-xl text-white font-bold text-[14px] shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: ACCENT }}>
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: ACCENT }} />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
