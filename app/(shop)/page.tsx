"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  TrendingUp,
} from "lucide-react";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard, { type Product } from "@/components/customer/ProductCard";
import SearchFilterStrip from "@/components/customer/SearchFilterStrip";
import RecentlyViewed from "@/components/customer/RecentlyViewed";
import { api } from "@/lib/api";
import { cdnUrl } from "@/lib/utils";
import { recommendationsApi, type HomeRails } from "@/lib/recommendationsApi";
import ProductRail from "@/components/customer/ProductRail";
import { dealsApi, type Deal } from "@/lib/dealsApi";
import { Heart, TrendingUp as TrendingIcon, Zap } from "lucide-react";

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
    imageUrl: p.images?.[0] || undefined,
  };
}

export default function CustomerHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [homeRails, setHomeRails] = useState<HomeRails | null>(null);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortParam, setSortParam] = useState("newest");
  const [categoryParam, setCategoryParam] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const hasActiveFilters = !!categoryParam;

  // Categories don't change between paginated requests — cache the map from
  // the initial fetch and reuse it in loadMore instead of refetching every
  // infinite-scroll page.
  const catMapRef = useRef<Map<string, string>>(new Map());

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

        // Fetch products, categories, rails, and active deals in parallel
        const [productsRes, categoriesRes, railsRes, dealsRes] = await Promise.all([
          api.get<{ data: ApiProduct[]; total: number }>(
            `/api/products?${queryParams.toString()}`
          ),
          api.get<{ categories: ApiCategory[] } | ApiCategory[]>("/api/categories").catch(() => ({ categories: [] })),
          recommendationsApi.getHomeRails(),
          dealsApi.getDeals({ active_only: true }).catch(() => []),
        ]);

        if (cancelled) return;
        
        setHomeRails(railsRes);

        // Build category lookup and cache it for loadMore.
        const catMap = new Map<string, string>();
        const rawCats = categoriesRes;
        const cats = Array.isArray(rawCats) ? rawCats : (rawCats as { categories: ApiCategory[] })?.categories ?? [];
        for (const c of cats) {
          catMap.set(c.id, c.name);
        }
        catMapRef.current = catMap;

        // Process Flash Deals
        const dealsProducts = dealsRes
          .filter((d: Deal) => d.products)
          .map((d: Deal) => ({
            id: d.product_id,
            name: d.products!.name,
            seller: "",
            category: d.products!.category_id ? catMap.get(d.products!.category_id) || "" : "",
            originalPrice: d.products!.base_price,
            price: d.deal_price,
            minOrder: `${d.products!.min_order_qty || 1} ${d.products!.unit || 'unit'}${d.products!.min_order_qty! > 1 ? "s" : ""}`,
            badge: "Flash Deal" as "New Arrival", // Force type casting for our quick badge addition
            imageUrl: d.products!.images?.[0] || undefined,
          }));
        setFlashDeals(dealsProducts);

        const items = productsRes?.data ?? [];
        const dealsMap = new Map(dealsProducts.map(dp => [dp.id, dp]));

        const mapped = items.map((p) => {
          const card = toCardProduct(p, p.category_id ? catMap.get(p.category_id) : undefined);
          const deal = dealsMap.get(card.id);
          if (deal) {
            card.price = deal.price;
            card.badge = "Flash Deal" as "New Arrival";
          }
          return card;
        });
        
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

      // Reuse the categories map from the initial fetch — it won't change
      // mid-scroll. Falls back to an empty map if the initial load failed.
      const productsRes = await api.get<{ data: ApiProduct[]; total: number }>(
        `/api/products?${queryParams.toString()}`
      );

      const catMap = catMapRef.current;

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
    <div className="py-1 md:py-6">

      {/* -- Mobile Visual Category Strip (<md) -- */}
      <Suspense fallback={<div className="h-[120px] bg-white w-full md:hidden" />}>
        <MobileCategoryStrip />
      </Suspense>

      {/* Hero */}
      <HeroBanner />

      {/* Flash Deals Rail */}
      {flashDeals.length > 0 && (
        <div className="mt-8">
          <ProductRail 
            title="Flash Deals" 
            products={flashDeals} 
            icon={Zap} 
            iconColor="#EF4444"
          />
        </div>
      )}

      {/* Personalized Rails (Wishlist & Server-driven Trending) */}
      {homeRails && (
        <div className="mt-8">
          <ProductRail 
            title="Trending Products" 
            products={homeRails.trending} 
            icon={TrendingIcon} 
            iconColor="#F59E0B"
          />
          <ProductRail 
            title="Based on your Wishlist" 
            products={homeRails.wishlistBased} 
            icon={Heart} 
            iconColor="#DC2626"
          />
        </div>
      )}

      {/* Recently Viewed (Local storage fallback) */}
      <RecentlyViewed />


      {/* Discover Products */}
      <section className="px-3 sm:px-8" style={{ marginTop: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" style={{ color: '#1A6FD4' }} strokeWidth={2} />
            <h2
              className="font-bold"
              style={{ color: "#1A1A2E", fontSize: '20px' }}
            >
              Trending Now
            </h2>
          </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border"
                style={{ background: "#F3F4F6", borderColor: "#E8EEF4", height: 340 }}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
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
          className="fixed bottom-24 left-5 md:left-auto md:right-5 z-40 flex items-center gap-2 p-3 md:px-5 md:py-3 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 text-gray-700 hover:text-[#1A6FD4] hover:bg-blue-50 transition-all animate-in fade-in slide-in-from-bottom-5"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
          <span className="hidden md:inline font-bold text-sm">Scroll to top</span>
        </button>
      )}
    </div>
  );
}

const MOBILE_CATEGORIES: Record<string, any[]> = {
  ALL: [
    { name: "Bed", icon: Home, bg: "#EAF2FF", color: "#1A6FD4", image: cdnUrl("/categories/bed.png") },
    { name: "Fashion", icon: ShoppingBag, bg: "#FFF4E5", color: "#F59E0B", image: cdnUrl("/categories/fashion.png") },
    { name: "Accessories", icon: Cpu, bg: "#F3F4F6", color: "#4B5563", image: cdnUrl("/categories/accessories.png") },
    { name: "Home Living", icon: Armchair, bg: "#FEF2F2", color: "#EF4444", image: cdnUrl("/categories/home-living.png") },
  ],
  FASHION: [
    { name: "Men", icon: ShoppingBag, bg: "#bbebecff", color: "white", image: cdnUrl("/categories/men.png") },
    { name: "Women", icon: ShoppingBag, bg: "#FFF4E5", color: "#F59E0B", image: cdnUrl("/categories/women.png") },
    { name: "Kids", icon: ShoppingBag, bg: "#EAF2FF", color: "#1A6FD4", image: cdnUrl("/categories/kids.png") },
  ],
  ACCESSORIES: [
    { name: "Watch", icon: Cpu, bg: "#F3F4F6", color: "#4B5563", image: cdnUrl("/categories/watch.png") },
    { name: "Headwear", icon: Cpu, bg: "#FEF2F2", color: "#EF4444", image: cdnUrl("/categories/headwear.png") },
    { name: "Neckwear", icon: Cpu, bg: "#EAF2FF", color: "#1A6FD4", image: cdnUrl("/categories/neckwear.png") },
    { name: "Bags", icon: ShoppingBag, bg: "#FFF4E5", color: "#F59E0B", image: cdnUrl("/categories/bags.png") },
  ],
  "HOME LIVING": [
    { name: "Lamps", icon: Home, bg: "#FFF4E5", color: "#F59E0B", image: cdnUrl("/categories/lamps.png") },
    { name: "Curtains", icon: Home, bg: "#EAF2FF", color: "#1A6FD4", image: cdnUrl("/categories/curtains.png") },
    { name: "Rugs", icon: Home, bg: "#F3F4F6", color: "#4B5563", image: cdnUrl("/categories/rugs.png") },
    { name: "Decor", icon: Armchair, bg: "#FEF2F2", color: "#EF4444", image: cdnUrl("/categories/decor.png") },
  ],
};

function MobileCategoryStrip() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab")?.toUpperCase() || "ALL";
  const activeCategories = MOBILE_CATEGORIES[currentTab] || MOBILE_CATEGORIES.ALL;

  return (
    <div className="md:hidden w-full overflow-x-auto scrollbar-hide pt-4 pb-2 bg-white">
      <div 
        key={currentTab}
        className="flex items-start gap-4 px-4 min-w-max animate-in fade-in slide-in-from-right-8 duration-300 ease-out"
      >
        {activeCategories.map((cat) => (
          <button key={cat.name} className="flex flex-col items-center gap-2 w-[76px] shrink-0 group">
            <div 
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform group-active:scale-95 border border-[#F3F4F6] overflow-hidden relative"
              style={{ background: cat.bg }}
            >
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <cat.icon className={`w-8 h-8 ${cat.image ? 'hidden' : ''}`} style={{ color: cat.color }} strokeWidth={1.5} />
            </div>
            <span className="text-[12px] font-bold text-center leading-tight text-[#374151]">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
