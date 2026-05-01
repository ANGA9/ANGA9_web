"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import logoo from "@/assets/logoo.png";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

const MOBILE_TABS = ["ALL", "FASHION", "ACCESSORIES", "HOME LIVING"];

export default function MobileTopHeader() {
  return (
    <Suspense fallback={<div className="h-[120px] w-full bg-[#E8F0FE]" />}>
      <MobileTopHeaderContent />
    </Suspense>
  );
}

function MobileTopHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab")?.toUpperCase() || "ALL";
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
    <div className="w-full bg-gradient-to-b from-[#CDE0FF] via-[#EAF2FF] to-white relative overflow-hidden">
      {/* ── Row 1: Delivery Location (Top) ── */}
      <div className="flex items-center px-4 pt-3 pb-1.5 w-full">
        <button className="flex items-center gap-1.5 group">
          <MapPin className="w-[15px] h-[15px] text-[#1A6FD4] stroke-[2.5]" />
          <span className="text-[13px] font-bold text-[#1A1A2E] tracking-tight group-hover:text-[#1A6FD4] transition-colors">
            Deliver to Kalkaji, 110019
          </span>
          <ChevronDown className="w-[15px] h-[15px] text-[#9CA3AF] group-hover:text-[#1A6FD4] transition-colors" />
        </button>
      </div>

      {/* ── Row 2: Logo + Icons ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/">
          <Image src="/anga9-logo.png" alt="ANGA" width={80} height={28} priority style={{ objectFit: "contain" }} />
        </Link>

        {/* Notifications + Wishlist + Cart + Login */}
        <div className="flex items-center gap-4">
          <NotificationBell portalType="customer" />
          <Link href="/wishlist" className="relative">
            <Heart className="w-[20px] h-[20px] text-[#4B5563]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-[#4338CA] text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-[20px] h-[20px] text-[#4B5563]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-[#1A6FD4] text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <Link href="/account" className="flex items-center justify-center rounded-full shrink-0 border border-[#E8EEF4] bg-white w-8 h-8">
              <User className="w-[16px] h-[16px] text-[#1A1A2E]" />
            </Link>
          ) : (
            <button onClick={openLoginSheet} className="flex items-center justify-center rounded-full shrink-0 bg-[#EAF2FF] w-8 h-8">
              <User className="w-[16px] h-[16px] text-[#1A6FD4]" />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 3: Elevated Search Bar ── */}
      <div className="px-4 py-2 pb-4" ref={searchRef}>
        <div className="relative flex items-center gap-2.5 bg-white rounded-full px-4 py-2.5 shadow-sm border border-transparent focus-within:border-[#1A6FD4]/30 focus-within:shadow-md transition-all">
          <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
            <Image src={logoo} alt="Logo" width={26} height={26} className="object-cover" />
          </div>
          <input
            type="text"
            placeholder="Search for products, sellers..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 bg-transparent outline-none text-[15px] text-[#1A1A2E] placeholder:text-[#9CA3AF]"
          />
          <Mic className="w-[18px] h-[18px] text-[#6B7280] shrink-0" />
          <svg className="w-[18px] h-[18px] text-[#6B7280] shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-2xl border border-[#E8EEF4] overflow-hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-60">
              {!searchQuery.trim() ? (
                <div className="p-4 flex flex-col gap-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-[13px] font-bold text-[#4B5563] mb-2 uppercase tracking-wider">Recent Searches</h4>
                      <div className="flex flex-col">
                        {recentSearches.map((term) => (
                          <div key={term} className="flex items-center transition-colors hover:bg-gray-50 -mx-4 px-4">
                            <button className="flex-1 flex items-center gap-3 py-2.5 text-left" onClick={() => handleTagClick(term)}>
                              <History className="w-[15px] h-[15px] text-[#9CA3AF] shrink-0" />
                              <span className="text-[14.5px] text-[#4B5563] font-medium truncate">{term}</span>
                            </button>
                            <button onClick={(e) => removeRecentSearch(e, term)} className="p-2 text-[#9CA3AF] hover:text-[#EF4444] rounded-full transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-[13px] font-bold text-[#4B5563] mb-2 uppercase tracking-wider">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {(popularTags.length > 0 ? popularTags : ['Smartphones', 'Laptops', 'Headphones', 'Home Decor', 'Mens Wear']).map(tag => (
                        <button key={tag} className="px-3.5 py-1.5 rounded-full border border-[#E8EEF4] text-[13.5px] font-medium text-[#4B5563] bg-[#F8FBFF] hover:border-[#1A6FD4] transition-colors" onClick={() => handleTagClick(tag)}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((s) => (
                    <Link key={s.id} href={`/products/${s.id}`} onClick={() => setShowSuggestions(false)} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F8FBFF]">
                      <Search className="w-4 h-4 shrink-0 text-[#9CA3AF]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14.5px] truncate font-medium text-[#1A1A2E]">{s.name}</p>
                        {s.category_name && <p className="text-[12px] text-[#6B7280]">{s.category_name}</p>}
                      </div>
                    </Link>
                  ))}
                  <button onClick={handleSearchSubmit} className="w-full px-4 py-3 text-[14.5px] font-bold text-left border-t border-[#E8EEF4] text-[#1A6FD4] hover:bg-[#F8FBFF] transition-colors">
                    Search for &quot;{searchQuery}&quot;
                  </button>
                </div>
              ) : (
                <div className="px-4 py-6 text-[14.5px] text-[#9CA3AF] text-center font-medium">
                  {searchQuery.length < 2 ? "Type at least 2 characters..." : "No matches found"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Folder Tabs ── */}
      <div className="w-full pt-1 bg-transparent">
        <div className="flex items-center justify-between px-1 sm:px-2 border-b border-[#E5E7EB]">
          {MOBILE_TABS.map((tab) => {
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => router.push(`/?tab=${tab.toLowerCase()}`)}
                className={`relative flex-1 flex justify-center py-3 text-[11px] sm:text-[13px] font-bold tracking-wider transition-colors ${
                  isActive ? "text-[#1A1A2E]" : "text-[#6B7280]"
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 mx-auto w-[60%] h-[3.5px] bg-[#1A6FD4] rounded-t-full shadow-[0_-1px_4px_rgba(26,111,212,0.3)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
