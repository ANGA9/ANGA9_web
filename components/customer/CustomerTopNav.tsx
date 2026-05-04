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
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [ipDetected, setIpDetected] = useState<{ city: string; pincode: string } | null>(null);
  const [ipDetectError, setIpDetectError] = useState("");
  const [ipDetectLoading, setIpDetectLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pincodeRef = useRef<HTMLDivElement>(null);
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
    const IP_CACHE_KEY = "ipLocation";
    const USER_KEY = "userPincode";
    const TTL_MS = 24 * 60 * 60 * 1000;

    try {
      const userSaved = localStorage.getItem(USER_KEY);
      if (userSaved) {
        const parsed = JSON.parse(userSaved) as { city: string; pincode: string };
        if (parsed.city && parsed.pincode) {
          setLocation(parsed);
          return;
        }
      }
    } catch {}

    try {
      const cached = localStorage.getItem(IP_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { city: string; pincode: string; ts: number };
        if (Date.now() - parsed.ts < TTL_MS && parsed.city && parsed.pincode) {
          setLocation({ city: parsed.city, pincode: parsed.pincode });
          return;
        }
      }
    } catch {}

    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { city?: string; postal?: string } | null) => {
        if (cancelled || !data?.city || !data?.postal) return;
        const next = { city: data.city, pincode: data.postal };
        setLocation(next);
        try {
          localStorage.setItem(IP_CACHE_KEY, JSON.stringify({ ...next, ts: Date.now() }));
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const submitPincode = async (raw: string) => {
    const pin = raw.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError("Enter a valid 6-digit pincode");
      return;
    }
    setPincodeError("");
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = (await res.json()) as Array<{
        Status: string;
        PostOffice?: Array<{ Name: string; District: string; State: string }>;
      }>;
      const entry = data?.[0];
      if (entry?.Status !== "Success" || !entry.PostOffice?.length) {
        setPincodeError("Pincode not found");
        return;
      }
      const office = entry.PostOffice[0];
      const city = office.District || office.Name;
      const next = { city, pincode: pin };
      setLocation(next);
      try {
        localStorage.setItem("userPincode", JSON.stringify(next));
      } catch {}
      setPincodeOpen(false);
      setPincodeInput("");
    } catch {
      setPincodeError("Could not look up pincode. Try again.");
    } finally {
      setPincodeLoading(false);
    }
  };

  useEffect(() => {
    if (!pincodeOpen) return;
    function handleClick(e: MouseEvent) {
      if (pincodeRef.current && !pincodeRef.current.contains(e.target as Node)) {
        setPincodeOpen(false);
        setPincodeError("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pincodeOpen]);

  const useMyLocation = async () => {
    setIpDetectError("");
    setIpDetected(null);
    setIpDetectLoading(true);
    try {
      const next = await detectLocationFromBrowser();
      setIpDetected(next);
      setLocation(next);
      try {
        localStorage.setItem("userPincode", JSON.stringify(next));
      } catch {}
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e?.code === 1) setIpDetectError("Permission denied. Enter pincode manually.");
      else if (e?.code === 3) setIpDetectError("Location request timed out");
      else setIpDetectError(e?.message || "Could not get location");
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
    <header className="sticky top-0 z-40 w-full" style={{ background: `linear-gradient(to bottom, ${t.bgBlueTint}, ${t.bgCard})` }}>

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
            className="shrink-0"
            style={{ minWidth: "fit-content" }}
          >
            <Image
              src={cdnUrl("/anga9-logo.png")}
              alt="ANGA"
              width={110}
              height={36}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          <div className="flex-1" />

          {/* Pincode + Become a Seller + Login */}
          <div className="flex items-center" style={{ gap: 24, minWidth: "fit-content" }}>
            <div className="relative" ref={pincodeRef}>
              <button
                onClick={() => setPincodeOpen((v) => !v)}
                className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
                style={{ color: t.textSecondary, fontSize: '16px' }}
              >
                <MapPin style={{ width: 18, height: 18, color: t.bluePrimary }} />
                {location ? `Deliver to ${location.city}, ${location.pincode}` : "Select Pincode"}
                <ChevronDown style={{ width: 14, height: 14 }} />
              </button>
              {pincodeOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-[320px] rounded-2xl border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50 p-4"
                  style={{ borderColor: t.border }}
                >
                  <div className="text-[14px] font-bold mb-1" style={{ color: t.textPrimary }}>
                    Enter delivery pincode
                  </div>
                  <div className="text-[12.5px] mb-3" style={{ color: t.textMuted }}>
                    We&apos;ll show prices and shipping times for your area.
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={pincodeInput}
                      onChange={(e) => {
                        setPincodeInput(e.target.value.replace(/\D/g, ""));
                        if (pincodeError) setPincodeError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitPincode(pincodeInput);
                      }}
                      placeholder="6-digit pincode"
                      className="flex-1 rounded-lg border px-3 py-2 text-[14px] outline-none focus:border-[#1A6FD4]"
                      style={{ borderColor: t.borderSearch, color: t.textPrimary }}
                    />
                    <button
                      onClick={() => submitPincode(pincodeInput)}
                      disabled={pincodeLoading}
                      className="rounded-lg px-3 py-2 text-[13px] font-bold text-white transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: t.bluePrimary }}
                    >
                      {pincodeLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  <button
                    onClick={useMyLocation}
                    disabled={ipDetectLoading}
                    title="Use device location (asks for permission)"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold transition-opacity disabled:opacity-60"
                    style={{ borderColor: t.borderSearch, color: t.bluePrimary }}
                  >
                    <RotateCw style={{ width: 14, height: 14 }} className={ipDetectLoading ? "animate-spin" : ""} />
                    {ipDetectLoading ? "Detecting…" : "Use my location"}
                  </button>
                  {pincodeError && (
                    <div className="mt-2 text-[12.5px]" style={{ color: t.outOfStock }}>
                      {pincodeError}
                    </div>
                  )}
                  {(ipDetected || ipDetectError || ipDetectLoading) && (
                    <div className="mt-3 rounded-lg border p-2.5 text-[12px]" style={{ borderColor: t.border, backgroundColor: t.bgBlueTint }}>
                      <div className="font-bold mb-0.5" style={{ color: t.textSecondary }}>
                        Detection result
                      </div>
                      {ipDetectLoading ? (
                        <div style={{ color: t.textMuted }}>Checking…</div>
                      ) : ipDetectError ? (
                        <div style={{ color: t.outOfStock }}>{ipDetectError}</div>
                      ) : ipDetected ? (
                        <div style={{ color: t.textPrimary }}>
                          {ipDetected.city}, {ipDetected.pincode}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/seller/sell-on-anga9"
              className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: '16px' }}
            >
              <Store style={{ width: 18, height: 18, color: t.bluePrimary }} />
              Sell on ANGA9
            </Link>
            <div className="relative">
              {loading ? (
                <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
              ) : isLoggedIn ? (
                <Link
                  href="#"
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
            <input
              type="text"
              placeholder="Search products, sellers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full outline-none transition-colors"
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${t.bluePrimary}`,
                borderRadius: 4,
                padding: "12px 48px 12px 16px",
                fontSize: '16px',
                color: t.textPrimary,
                lineHeight: "1.4",
              }}
            />
            {/* Icon with left-border separator */}
            <button
              onClick={handleSearchSubmit}
              className="absolute top-1/2 -translate-y-1/2 flex items-center cursor-pointer"
              style={{
                right: 0,
                height: "100%",
                paddingLeft: 10,
                paddingRight: 12,
                borderLeft: "1.5px solid #E8EEF4",
                color: t.bluePrimary,
              }}
            >
              <Search style={{ width: 20, height: 20 }} />
            </button>

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
              className="flex items-center gap-2 font-medium transition-colors hover:text-[#4338CA]"
              style={{ color: t.textSecondary, fontSize: '16px' }}
            >
              <div className="relative">
                <Heart style={{ width: 20, height: 20 }} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "#4338CA", color: "#FFFFFF" }}
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
              className="relative"
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
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    zIndex: 50,
                  }}
                >
                  {[
                    { icon: Package, label: "My Orders", href: "/orders" },
                    { icon: Store, label: "Sell on ANGA9", href: "/seller/sell-on-anga9" },
                    { icon: Megaphone, label: "Advertise on ANGA9" },
                    { icon: Download, label: "Download the App" },
                  ].map((item) => {
                    const inner = (
                      <>
                        <item.icon style={{ width: 18, height: 18, color: t.textSecondary }} />
                        <span>{item.label}</span>
                      </>
                    );
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

    </header>
  );
}
