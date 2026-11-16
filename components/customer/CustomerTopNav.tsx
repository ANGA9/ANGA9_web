"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cdnUrl } from "@/lib/utils";
import {
  Search,
  Heart,
  ShoppingCart,
  MapPin,
  ChevronDown,
  Package,
  Store,
  Megaphone,
  Download,
  User,
  HandHeart,
  CircleUserRound,
  History,
  X,
  RotateCw,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { detectLocationFromBrowser } from "@/lib/detectLocation";
import LocationDrawer from "./LocationDrawer";
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
  images?: string[];
}

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerTopNav() {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [showCallout, setShowCallout] = useState(true);
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const moreRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [location, setLocation] = useState<{ city: string; pincode: string } | null>(null);
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [ipDetectError, setIpDetectError] = useState("");
  const [ipDetectLoading, setIpDetectLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const searchStorageKey = `recentSearches_${user?.id || 'guest'}`;

  const SEARCH_WORDS = [
    "accessories",
    "formal shirts",
    "home decor",
    "footwear",
    "kitchenware",
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [SEARCH_WORDS.length]);

  useEffect(() => {
    // Fetch popular tags on mount
    api.get<{ tags?: string[] }>("/api/search/filters", { silent: true })
      .then(res => {
        if (res?.tags) setPopularTags(res.tags.slice(0, 10)); // Show top 10
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const USER_KEY = "userPincode";
    try {
      const userSaved = localStorage.getItem(USER_KEY);
      if (userSaved) {
        const parsed = JSON.parse(userSaved) as { city: string; pincode: string };
        if (parsed?.city && parsed?.pincode) {
          setLocation(parsed);
          return;
        }
      }
    } catch {}
    // Do NOT auto-fetch IP location or default to South Delhi 110016.
    // Leave location as null so "Add a location" is displayed!
  }, []);

  const useMyLocation = async () => {
    setIpDetectError("");
    setIpDetectLoading(true);
    try {
      const next = await detectLocationFromBrowser();
      if (next && next.city) {
        setLocation(next);
        try {
          localStorage.setItem("userPincode", JSON.stringify(next));
        } catch {}
      }
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      let msg = "Could not detect location";
      if (e?.code === 1) {
        msg = "Location permission denied in browser";
      } else if (e?.code === 3) {
        msg = "Location request timed out";
      } else if (e?.message) {
        msg = e.message;
      }
      setIpDetectError(msg);
      setTimeout(() => setIpDetectError(""), 4000);
    } finally {
      setIpDetectLoading(false);
    }
  };
      
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

  useEffect(() => {
    if (isLoggedIn) setShowCallout(false);
    else {
      const timer = setTimeout(() => setShowCallout(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  return (
    <header
      className="w-full relative z-50"
      style={{
        background: "linear-gradient(to bottom, #D6E6FA 0%, #E8F1FD 40%, #F6FAFE 75%, #FFFFFF 100%)",
      }}
    >

      {/* ── Row 1: full-width bg band ── */}
      <div className="w-full border-b" style={{ borderColor: t.border }}>
        {/* constrained content */}
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1400, padding: "0 48px", height: 72 }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5"
            style={{ minWidth: "fit-content" }}
          >
            <div
              className="w-[36px] h-[36px] rounded-[8px] overflow-hidden flex items-center justify-center shrink-0 shadow-xs"
              style={{ borderRadius: 8 }}
            >
              <Image
                src="/final_logo1.png"
                alt="ANGA9 Icon"
                width={36}
                height={36}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <Image
              src="/anga9-logo.png"
              alt="ANGA9"
              width={105}
              height={36}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          <div className="flex-1" />

          {/* Location + Become a Seller + Login */}
          <div className="flex items-center" style={{ gap: 24, minWidth: "fit-content" }}>
            {/* Delivery Location: Add a location OR Deliver to City, Pincode + Change location */}
            <div>
              {!location ? (
                <button
                  type="button"
                  onClick={() => setLocationDrawerOpen(true)}
                  className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4] group select-none"
                  style={{ color: t.textSecondary, fontSize: "16px" }}
                  title="Click to add delivery location"
                >
                  <MapPin
                    style={{ width: 18, height: 18, color: t.bluePrimary }}
                    className="group-hover:scale-105 transition-transform"
                  />
                  <span>Add a location</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => setLocationDrawerOpen(true)}
                    className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4] group"
                    style={{ color: t.textSecondary, fontSize: "16px" }}
                    title="Click to change location"
                  >
                    <MapPin
                      style={{ width: 18, height: 18, color: t.bluePrimary }}
                      className="group-hover:scale-105 transition-transform shrink-0"
                    />
                    <span className="truncate max-w-[260px]">
                      Deliver to {location.city}{location.pincode ? `, ${location.pincode}` : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationDrawerOpen(true)}
                    className="text-[#1A6FD4] hover:underline font-semibold text-[14px] cursor-pointer whitespace-nowrap ml-0.5"
                  >
                    Change location
                  </button>
                </div>
              )}
            </div>

            <a
              href="https://seller.anga9.com/sell-on-anga9"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: '16px' }}
            >
              <Store style={{ width: 18, height: 18, color: t.bluePrimary }} />
              Sell on ANGA9
            </a>
            <div className="relative">
              {loading ? (
                <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : isLoggedIn ? (
                <Link
                  href="https://play.google.com/store/apps/details?id=com.anga9.customer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:opacity-80"
                  style={{ color: t.bluePrimary, fontSize: '16px' }}
                >
                  <Download style={{ width: 20, height: 20 }} />
                  <span>Download the app</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
                    style={{ color: t.textPrimary, fontSize: '16px' }}
                  >
                    <User style={{ width: 18, height: 18 }} />
                    Login
                  </Link>

                  {/* Callout tooltip */}
                  {showCallout && (
                    <>
                      <style>{`
                        @keyframes calloutJiggle {
                          0%, 70% { transform: translateX(0); }
                          74% { transform: translateX(-2px); }
                          78% { transform: translateX(2px); }
                          82% { transform: translateX(-2px); }
                          86% { transform: translateX(2px); }
                          90% { transform: translateX(-1px); }
                          94% { transform: translateX(1px); }
                          100% { transform: translateX(0); }
                        }
                      `}</style>
                      <div
                        className="absolute whitespace-nowrap rounded-lg flex items-center justify-center text-base md:text-lg font-normal tracking-wide"
                        style={{
                          top: "calc(100% + 14px)",
                          right: -10,
                          height: 52,
                          padding: "0 28px",
                          background: t.bluePrimary,
                          color: "#FFFFFF",
                          zIndex: 50,
                          animation: "calloutJiggle 2s ease-in-out infinite",
                        }}
                      >
                        {/* Arrow pointing up */}
                        <div
                          className="absolute"
                          style={{
                            top: -5,
                            right: 24,
                            width: 10,
                            height: 10,
                            background: t.bluePrimary,
                            transform: "rotate(45deg)",
                          }}
                        />
                        Login for better offers
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: full-width bg band ── */}
      <div className="w-full border-b" style={{ borderColor: t.border }}>
        {/* constrained content */}
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1400, padding: "0 48px", height: 72 }}
        >
          {/* Search bar — flex:1, max 700px */}
          <div
            className="relative"
            style={{ flex: 1, maxWidth: 700 }}
            ref={searchRef}
          >
            <style>{`
              @keyframes searchHintIn {
                0% { transform: translateY(100%); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
            `}</style>

            <div
              className="relative flex items-center w-full transition-all duration-200 bg-white"
              style={{
                height: 44,
                borderRadius: 8,
                border: "2px solid #0F4C9C",
                boxShadow: isSearchFocused
                  ? "0 0 0 2px rgba(15, 76, 156, 0.18)"
                  : "none",
              }}
            >
              {/* Left Search Icon (like Flipkart) */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="pl-3.5 pr-2.5 h-full flex items-center justify-center text-gray-500 hover:text-[#0F4C9C] transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search style={{ width: 19, height: 19 }} />
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full h-full outline-none bg-transparent font-normal text-black"
                style={{
                  borderRadius: 8,
                  paddingRight: searchQuery ? "40px" : "16px",
                  fontSize: '17px',
                  color: "#000000",
                  lineHeight: "1.4",
                }}
              />

              {/* Animated Rotating Placeholder (when searchQuery is empty) */}
              {!searchQuery && (
                <div className="pointer-events-none absolute left-[44px] top-1/2 -translate-y-1/2 flex items-center text-[17px] select-none">
                  <span className="shrink-0 text-gray-700 font-normal">Search for&nbsp;</span>
                  <div className="relative min-w-[220px] h-[24px] overflow-hidden">
                    <span
                      key={placeholderIdx}
                      className="absolute inset-0 flex items-center truncate text-[#0F4C9C] font-normal"
                      style={{ animation: "searchHintIn 450ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
                    >
                      &quot;{SEARCH_WORDS[placeholderIdx]}&quot;
                    </span>
                  </div>
                </div>
              )}

              {/* Clear button (X) */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] rounded-xl border overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#1A6FD4",
                  boxShadow: "0 10px 25px -4px rgba(0,0,0,0.12)",
                  zIndex: 60,
                }}
              >
                {!searchQuery.trim() ? (
                  <div className="p-5 flex flex-col gap-5">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <h4 className="text-[15px] font-bold text-gray-700 mb-3">Recent Searches</h4>
                        <div className="flex flex-col">
                          {recentSearches.map((term) => (
                            <div key={term} className="flex items-center transition-colors hover:bg-gray-50 -mx-5 px-5 group">
                              <button
                                className="flex-1 flex items-center gap-3 py-2 text-left"
                                onClick={() => handleTagClick(term)}
                              >
                                <History className="w-[18px] h-[18px] text-gray-500 shrink-0" />
                                <span className="text-[15px] text-gray-600 font-medium truncate">
                                  {term}
                                </span>
                              </button>
                              <button 
                                onClick={(e) => removeRecentSearch(e, term)}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-[18px] h-[18px]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Searches */}
                    <div>
                      <h4 className="text-[15px] font-bold text-gray-700 mb-3">Popular Searches</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {(popularTags.length > 0 ? popularTags : ['Smartphones', 'Laptops', 'Headphones', 'Home Decor', 'Mens Wear']).map(tag => (
                          <button
                            key={tag}
                            className="px-4 py-1.5 rounded-full border text-[14px] font-medium transition-all hover:border-[#1A6FD4] cursor-pointer"
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
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#F8FBFF]"
                      >
                        <Search className="w-[18px] h-[18px] shrink-0 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] truncate font-medium" style={{ color: t.textPrimary }}>
                            {s.name}
                          </p>
                          <p className="text-[13px] text-gray-500">
                            {s.category_name && `${s.category_name} · `}{formatINR(s.base_price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-5 py-3 text-[15px] font-bold text-left border-t transition-colors hover:bg-[#F8FBFF]"
                      style={{ borderColor: t.border, color: t.bluePrimary }}
                    >
                      Search for &quot;{searchQuery}&quot;
                    </button>
                  </div>
                ) : (
                  <div className="px-5 py-6 text-[15px] text-gray-500 text-center font-medium">
                    {searchQuery.length < 2 ? "Type at least 2 characters..." : "No matches found"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right icons group */}
          <div
            className="flex items-center shrink-0"
            style={{ marginLeft: 40, gap: 36, minWidth: "fit-content" }}
          >
            {/* Notifications */}
            <NotificationBell portalType="customer" />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-2 font-medium transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: '16px' }}
            >
              <div className="relative">
                <Heart style={{ width: 20, height: 20 }} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "#1A6FD4", color: "#FFFFFF" }}
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </div>
              Wishlist
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 font-medium transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: '16px' }}
            >
              <div className="relative">
                <ShoppingCart style={{ width: 20, height: 20 }} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: t.primaryCta, color: t.ctaText }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              Cart
            </Link>

            {/* Profile Icon (when logged in) */}
            {!loading && isLoggedIn && (
              <Link
                href="/account"
                className="flex items-center gap-2 font-medium transition-colors hover:text-[#1A6FD4]"
                style={{ color: t.textSecondary, fontSize: '16px' }}
              >
                <CircleUserRound style={{ width: 20, height: 20 }} />
                Profile
              </Link>
            )}

            {/* More */}
            <div
              className="relative z-50"
              ref={moreRef}
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
                style={{ color: t.textSecondary, fontSize: '16px' }}
              >
                More
                <ChevronDown style={{ width: 16, height: 16 }} />
              </button>

              {moreOpen && (
                <div
                  className="absolute right-0 top-full w-56 rounded-lg border py-1.5"
                  style={{
                    background: "#FFFFFF",
                    borderColor: t.border,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                    zIndex: 100,
                  }}
                >
                  {[
                    { icon: Package, label: "My Orders", href: "/orders" },
                    { icon: Store, label: "Sell on ANGA9", href: "https://seller.anga9.com/sell-on-anga9", external: true },
                    { icon: Megaphone, label: "Advertise on ANGA9" },
                    { icon: Download, label: "Download the App", href: "https://play.google.com/store/apps/details?id=com.anga9.customer", external: true },
                  ].map((item) => {
                    const inner = (
                      <>
                        <item.icon style={{ width: 18, height: 18, color: t.textSecondary }} />
                        <span>{item.label}</span>
                      </>
                    );
                    if (item.href && item.external) {
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[#F3F4F6]"
                          style={{ color: t.textPrimary, fontSize: '16px' }}
                        >
                          {inner}
                        </a>
                      );
                    }
                    if (item.href) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[#F3F4F6]"
                          style={{ color: t.textPrimary, fontSize: '16px' }}
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[#F3F4F6] text-left"
                        style={{ color: t.textPrimary, fontSize: '16px' }}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right-side Delivery Location Panel */}
      <LocationDrawer
        isOpen={locationDrawerOpen}
        onClose={() => setLocationDrawerOpen(false)}
        currentLocation={location}
        onSelectLocation={(next) => {
          setLocation(next);
          try {
            localStorage.setItem("userPincode", JSON.stringify(next));
          } catch {}
        }}
        isLoggedIn={isLoggedIn}
      />
    </header>
  );
}
