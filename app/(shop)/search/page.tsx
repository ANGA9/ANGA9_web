"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import EmptyState from "@/components/shared/EmptyState";

interface SearchProduct {
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
  category_name?: string;
  seller_name?: string;
}

interface SearchFilters {
  categories: { name: string; count: number }[];
  price_range: { min: number; max: number };
  sellers: { name: string; count: number }[];
}

interface SearchResponse {
  data: SearchProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

function toCardProduct(p: SearchProduct): Product {
  return {
    id: p.id,
    name: p.name,
    seller: p.seller_name || "",
    category: p.category_name || "",
    originalPrice: p.base_price,
    price: p.sale_price ?? p.base_price,
    minOrder: p.min_order_qty ? `${p.min_order_qty} ${p.unit || 'unit'}${p.min_order_qty > 1 ? "s" : ""}` : "Not specified",
    imageUrl: p.images?.[0] || undefined,
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    sellers: false,
  });

  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

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
          filters
            ? Promise.resolve(filters)
            : api.get<SearchFilters>("/api/search/filters", { silent: true }),
        ]);

        if (cancelled) return;

        const mapped = (searchRes?.data ?? []).map(toCardProduct);
        setProducts(mapped);
        setTotal(searchRes?.total ?? 0);
        setTotalPages(searchRes?.totalPages ?? 0);
        if (filtersRes && !filters) setFilters(filtersRes);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [query, categoryParam, sortParam, minPriceParam, maxPriceParam, pageParam, filters]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const applyPriceFilter = () => {
    updateUrl({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  };

  const clearAllFilters = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setLocalMinPrice("");
    setLocalMaxPrice("");
  };

  const hasActiveFilters = !!(categoryParam || minPriceParam || maxPriceParam);

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base" style={{ color: t.textPrimary }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs md:text-sm font-medium"
            style={{ color: t.bluePrimary }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      {filters?.categories && filters.categories.length > 0 && (
        <div className="border-t pt-4" style={{ borderColor: t.border }}>
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm md:text-base font-semibold" style={{ color: t.textPrimary }}>
              Category
            </span>
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4" style={{ color: t.textMuted }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: t.textMuted }} />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2">
              {filters.categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() =>
                    updateUrl({
                      category: categoryParam === cat.name ? "" : cat.name,
                    })
                  }
                  className="flex items-center justify-between w-full text-left py-1 px-2 rounded transition-colors hover:bg-gray-50"
                >
                  <span
                    className="text-sm md:text-base"
                    style={{
                      color: categoryParam === cat.name ? t.bluePrimary : t.textSecondary,
                      fontWeight: categoryParam === cat.name ? 600 : 400,
                    }}
                  >
                    {cat.name}
                  </span>
                  <span className="text-xs md:text-sm" style={{ color: t.textMuted }}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-t pt-4" style={{ borderColor: t.border }}>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-sm md:text-base font-semibold" style={{ color: t.textPrimary }}>
            Price Range
          </span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" style={{ color: t.textMuted }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: t.textMuted }} />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={filters?.price_range?.min?.toString() || "Min"}
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full h-9 rounded-lg border px-3 text-sm md:text-base outline-none focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10"
                style={{ borderColor: t.border, color: t.textPrimary }}
              />
              <span className="text-sm md:text-base shrink-0" style={{ color: t.textMuted }}>
                to
              </span>
              <input
                type="number"
                placeholder={filters?.price_range?.max?.toString() || "Max"}
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full h-9 rounded-lg border px-3 text-sm md:text-base outline-none focus:border-[#1A6FD4] focus:ring-2 focus:ring-[#1A6FD4]/10"
                style={{ borderColor: t.border, color: t.textPrimary }}
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full h-8 rounded-lg text-xs md:text-sm font-semibold transition-colors hover:opacity-90"
              style={{ background: t.bgBlueTint, color: t.bluePrimary }}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Sellers */}
      {filters?.sellers && filters.sellers.length > 0 && (
        <div className="border-t pt-4" style={{ borderColor: t.border }}>
          <button
            onClick={() => toggleSection("sellers")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm md:text-base font-semibold" style={{ color: t.textPrimary }}>
              Sellers
            </span>
            {expandedSections.sellers ? (
              <ChevronUp className="w-4 h-4" style={{ color: t.textMuted }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: t.textMuted }} />
            )}
          </button>
          {expandedSections.sellers && (
            <div className="space-y-2">
              {filters.sellers.map((seller) => (
                <div
                  key={seller.name}
                  className="flex items-center justify-between py-1 px-2"
                >
                  <span className="text-sm md:text-base" style={{ color: t.textSecondary }}>
                    {seller.name}
                  </span>
                  <span className="text-xs md:text-sm" style={{ color: t.textMuted }}>
                    {seller.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="font-bold text-[18px] md:text-2xl tracking-tight" style={{ color: t.textPrimary }}>
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          {!loading && (
            <span className="text-[13px] md:text-base font-medium" style={{ color: t.textMuted }}>
              ({total} found)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex-1 md:hidden flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-bold shadow-sm active:scale-95 transition-all bg-white"
            style={{ borderColor: t.border, color: t.textPrimary }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: t.bluePrimary }}
              />
            )}
          </button>

          {/* Sort */}
          <select
            value={sortParam}
            onChange={(e) => updateUrl({ sort: e.target.value })}
            className="flex-1 md:flex-none rounded-xl border px-3 py-2 text-[13px] md:text-base font-bold outline-none focus:border-[#1A6FD4] shadow-sm bg-white"
            style={{ borderColor: t.border, color: t.textPrimary }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div
          className="hidden md:block shrink-0"
          style={{ width: 240 }}
        >
          <div
            className="sticky top-[160px] rounded-xl border p-4"
            style={{ borderColor: t.border, background: t.bgCard }}
          >
            <FilterSidebar />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
            <div
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl p-5 pb-8 shadow-2xl transition-transform"
              style={{ background: t.bgCard }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base md:text-lg" style={{ color: t.textPrimary }}>
                  Filters
                </h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5" style={{ color: t.textSecondary }} />
                </button>
              </div>
              <FilterSidebar />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-5 rounded-xl py-3 text-sm md:text-base font-bold"
                style={{ background: t.primaryCta, color: t.ctaText }}
              >
                Show Results
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border"
                  style={{ background: "#F3F4F6", borderColor: t.border, height: 340 }}
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-4 px-1 sm:px-0">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", String(page));
                        router.push(`/search?${params.toString()}`);
                      }}
                      className="w-9 h-9 rounded-lg text-sm md:text-base font-medium transition-colors"
                      style={{
                        background: page === pageParam ? t.bluePrimary : "transparent",
                        color: page === pageParam ? "#FFFFFF" : t.textSecondary,
                        border: page === pageParam ? "none" : `1px solid ${t.border}`,
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No products found"
              description={
                query
                  ? `We couldn't find any products matching "${query}". Try different keywords or filters.`
                  : "No products match the current filters."
              }
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
              accentColor={t.bluePrimary}
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: t.bluePrimary }} />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
