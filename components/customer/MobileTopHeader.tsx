"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, MapPin, ChevronDown, Search, Mic, HandHeart, Heart, ShoppingCart, History, X } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { api } from "@/lib/api";
import NotificationBell from "@/components/shared/NotificationBell";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  category_name?: string;
  base_price: number;
}

const megaTabs = [
  "FASHION",
  "ACCESSORIES",
  "BED & BATH LINEN",
  "HOME DECOR & FLOORING",
];

export default function MobileTopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { open: openLoginSheet } = useLoginSheet();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const searchStorageKey = `recentSearches_${user?.id || 'guest'}`;

  useEffect(() => {
    // Fetch popular tags on mount
    api.get<{ tags?: string[] }>("/api/search/filters", { silent: true })
      .then(res => {
        if (res?.tags) setPopularTags(res.tags.slice(0, 10)); // Show top 10
      })
      .catch(() => {});
  }, []);
      
  useEffect(() => {
    // Load recent searches
    try {
      const saved = localStorage.getItem(searchStorageKey);
      if (saved) setRecentSearches(JSON.parse(saved));
      else setRecentSearches([]);
    } catch {}
  }, [searchStorageKey]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(searchStorageKey, JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter(t => t !== term);
      setRecentSearches(updated);
      localStorage.setItem(searchStorageKey, JSON.stringify(updated));
    } catch {}
  };

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await api.get<{ suggestions: Suggestion[] }>(
        `/api/search/autocomplete?q=${encodeURIComponent(q)}&limit=5`,
        { silent: true }
      );
      setSuggestions(res?.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSearchSubmit = () => {
    const term = searchQuery.trim();
    if (!term) return;
    saveRecentSearch(term);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    saveRecentSearch(tag);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide the home header on dedicated sub-pages
  if (pathname === "/account" || pathname === "/cart") return null;

  return (
    <div className="w-full">
      {/* ── Row 1: Logo + Login ── */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "12px 16px",
          background: t.bgCard,
        }}
      >
        {/* Logo */}
        <Link href="/">
          <Image
            src="/anga9-logo.png"
            alt="ANGA"
            width={90}
            height={31}
            priority
            style={{ objectFit: "contain" }}
          />
        </Link>

        {/* Notifications + Wishlist + Cart + Login */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell portalType="customer" />

          {/* Wishlist */}
          <Link href="/wishlist" className="relative">
            <Heart style={{ width: 22, height: 22, color: t.textSecondary }} />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "#4338CA", color: "#FFFFFF" }}
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingCart style={{ width: 22, height: 22, color: t.textSecondary }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: t.primaryCta, color: t.ctaText }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Login / User Greeting */}
          {isLoggedIn ? (
          <Link
            href="/account"
            className="flex items-center justify-center rounded-full shrink-0 border"
            style={{
              width: 34,
              height: 34,
              borderColor: t.border,
              background: "#FFFFFF",
            }}
          >
            <HandHeart style={{ width: 18, height: 18, color: t.textPrimary }} />
          </Link>
        ) : (
          <button
            onClick={openLoginSheet}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 38,
                height: 38,
                background: "#EAF2FF",
              }}
            >
              <User style={{ width: 18, height: 18, color: t.bluePrimary }} />
            </div>
            <span className="font-bold text-sm md:text-base leading-none" style={{ color: t.bluePrimary }}>
              Login
            </span>
          </button>
        )}
        </div>
      </div>

      {/* ── Row 2: Delivery Location ── */}
      <button
        className="flex items-center w-full border-b"
        style={{
          padding: "8px 16px",
          borderColor: t.border,
          background: t.bgCard,
        }}
      >
        <MapPin
          style={{
            width: 16,
            height: 16,
            color: t.bluePrimary,
            flexShrink: 0,
          }}
        />
        <div className="flex items-center gap-1.5 ml-2 flex-1 min-w-0">
          <span
            className="text-sm md:text-base font-semibold leading-tight"
            style={{ color: t.textPrimary }}
          >
            Location not set
          </span>
          <span
            className="text-sm md:text-base font-medium leading-tight"
            style={{ color: t.bluePrimary }}
          >
            Select delivery location
          </span>
        </div>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: t.textMuted,
            flexShrink: 0,
          }}
        />
      </button>

      {/* ── Row 3: Search Bar ── */}
      <div style={{ padding: "10px 12px", background: t.bgCard }} ref={searchRef}>
        <div
          className="relative flex items-center gap-2.5"
          style={{
            background: "#FFFFFF",
            borderRadius: 6,
            padding: "10px 14px",
            border: `1.5px solid ${t.bluePrimary}`,
          }}
        >
          <Search
            style={{
              width: 18,
              height: 18,
              color: t.bluePrimary,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 bg-transparent outline-none text-sm md:text-base"
            style={{ color: t.textPrimary }}
          />
          <Mic
            style={{
              width: 18,
              height: 18,
              color: t.textMuted,
              flexShrink: 0,
            }}
          />

          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden"
              style={{
                background: "#FFFFFF",
                borderColor: t.border,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                zIndex: 60,
              }}
            >
              {!searchQuery.trim() ? (
                <div className="p-4 flex flex-col gap-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-700 mb-2">Recent Searches</h4>
                      <div className="flex flex-col">
                        {recentSearches.map((term) => (
                          <div key={term} className="flex items-center transition-colors hover:bg-gray-50 -mx-4 px-4">
                            <button
                              className="flex-1 flex items-center gap-3 py-2 text-left"
                              onClick={() => handleTagClick(term)}
                            >
                              <History className="w-4 h-4 text-gray-500 shrink-0" />
                              <span className="text-[14px] text-gray-600 font-medium truncate">
                                {term}
                              </span>
                            </button>
                            <button 
                              onClick={(e) => removeRecentSearch(e, term)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Searches */}
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-700 mb-2">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {(popularTags.length > 0 ? popularTags : ['Smartphones', 'Laptops', 'Headphones', 'Home Decor', 'Mens Wear']).map(tag => (
                        <button
                          key={tag}
                          className="px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all hover:border-[#1A6FD4] cursor-pointer"
                          style={{ borderColor: "#E5E7EB", background: "#F8F9FA", color: "#374151" }}
                          onClick={() => handleTagClick(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/products/${s.id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F8FBFF]"
                    >
                      <Search className="w-4 h-4 shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] truncate font-medium" style={{ color: t.textPrimary }}>
                          {s.name}
                        </p>
                        {s.category_name && (
                          <p className="text-[12px] text-gray-500">
                            {s.category_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full px-4 py-3 text-[14px] font-bold text-left border-t transition-colors hover:bg-[#F8FBFF]"
                    style={{ borderColor: t.border, color: t.bluePrimary }}
                  >
                    Search for &quot;{searchQuery}&quot;
                  </button>
                </div>
              ) : (
                <div className="px-4 py-5 text-[14px] text-gray-500 text-center font-medium">
                  {searchQuery.length < 2 ? "Type at least 2 characters..." : "No matches found"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Category Tabs (static, no interaction) ── */}
      <div
        className="overflow-x-auto scrollbar-hide border-b"
        style={{
          background: t.bgCard,
          borderColor: t.border,
        }}
      >
        <div
          className="flex items-center gap-0.5"
          style={{ padding: "0 12px" }}
        >
          {megaTabs.map((tab) => (
            <div
              key={tab}
              className="shrink-0 flex items-center h-[44px] px-3 text-xs md:text-sm font-medium whitespace-nowrap"
              style={{ color: t.textPrimary }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
