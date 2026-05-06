"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import logoo from "@/assets/logoo.png";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { User, MapPin, Search, Mic, HandHeart, Heart, ShoppingCart, History, X, RotateCw, Pencil, Gift, Download } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { api } from "@/lib/api";
import { cdnUrl } from "@/lib/utils";
import { detectLocationFromBrowser } from "@/lib/detectLocation";
import { useVoiceSearch } from "@/lib/useVoiceSearch";
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

const MOBILE_TABS: { key: string; label: string; accent: string; gradientFrom: string; gradientVia: string }[] = [
  { key: "ALL",          label: "ALL",          accent: "#1A6FD4", gradientFrom: "#CDE0FF", gradientVia: "#EAF2FF" },
  { key: "FASHION",      label: "FASHION",      accent: "#E0598B", gradientFrom: "#FDE8EF", gradientVia: "#FFF2F6" },
  { key: "ACCESSORIES",  label: "ACCESSORIES",  accent: "#8B5CF6", gradientFrom: "#EDE9FE", gradientVia: "#F5F3FF" },
  { key: "HOME LIVING",  label: "HOME LIVING",  accent: "#2E9D6A", gradientFrom: "#E2F6EC", gradientVia: "#F0FAF5" },
];

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
  const activeTabConfig = MOBILE_TABS.find(t => t.key === currentTab) || MOBILE_TABS[0];
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
  const [location, setLocation] = useState<{ city: string; pincode: string } | null>(null);
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [ipDetected, setIpDetected] = useState<{ city: string; pincode: string } | null>(null);
  const [ipDetectError, setIpDetectError] = useState("");
  const [ipDetectLoading, setIpDetectLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const SEARCH_PLACEHOLDERS = [
    "Search for formal shirts",
    "Search for accessories",
    "Search for home decor",
    "Search for footwear",
    "Search for kitchenware",
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [SEARCH_PLACEHOLDERS.length]);

  // Promo banner — visible until dismissed in this session
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("anga9_promo_dismissed") === "1") {
      setShowPromoBanner(false);
    }
  }, []);
  const dismissPromoBanner = () => {
    setShowPromoBanner(false);
    try {
      sessionStorage.setItem("anga9_promo_dismissed", "1");
    } catch {}
  };

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

  // Voice search (Web Speech API — free, browser-built-in)
  const voice = useVoiceSearch({
    lang: "en-IN",
    onResult: (text) => {
      setSearchQuery(text);
      setShowSuggestions(true);
    },
    onEnd: (finalText) => {
      const term = finalText.trim();
      if (!term) return;
      saveRecentSearch(term);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    onError: (msg) => {
      console.warn("[voice]", msg);
    },
  });

  const handleMicClick = () => {
    if (!voice.isSupported) {
      alert("Voice search isn't supported on this browser. Try Chrome or Edge.");
      return;
    }
    voice.toggle();
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
    <div
      className="w-full relative transition-all duration-500"
      style={{ background: `linear-gradient(to bottom, ${activeTabConfig.gradientFrom}, ${activeTabConfig.gradientVia}, #ffffff)` }}
    >
      {/* ── Promo Banner (above delivery row) ── */}
      {showPromoBanner && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#EAF2FF]/80 backdrop-blur-md border-b border-[#D0E3F7]/50">
          <span className="shrink-0 inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[#1A6FD4]/10 text-[#1A6FD4]">
            <Gift className="w-[13px] h-[13px]" strokeWidth={2.5} />
          </span>
          <span className="flex-1 text-[12.5px] leading-tight tracking-tight">
            <span className="font-bold text-[#1A6FD4]">Extra 25% OFF</span>
            <span className="text-[#4B5563] font-medium"> on your first order</span>
          </span>
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A6FD4] text-white text-[11px] font-bold tracking-wide active:scale-95 transition-all shadow-sm shadow-[#1A6FD4]/20 hover:bg-[#155ab0]"
          >
            <Download className="w-[12px] h-[12px]" strokeWidth={2.5} />
            Download
          </button>
          <button
            type="button"
            onClick={dismissPromoBanner}
            aria-label="Dismiss banner"
            className="shrink-0 -mr-1.5 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#1A6FD4] hover:bg-[#1A6FD4]/10 transition-colors"
          >
            <X className="w-[14px] h-[14px]" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Row 1: Delivery Location ── */}
      <div className="relative flex items-center px-4 pt-3 pb-1.5 w-full" ref={pincodeRef}>
        <button onClick={() => setPincodeOpen((v) => !v)} className="flex items-center gap-1.5 group">
          <MapPin className="w-[15px] h-[15px] text-[#1A1A2E] stroke-[2.5]" />
          <span className="text-[13px] font-medium text-[#4B5563] tracking-tight">Deliver to</span>
          <span className="text-[13px] font-bold text-[#1A1A2E] tracking-tight">
            {location ? `${location.city}, ${location.pincode}` : "Set Pincode"}
          </span>
          <Pencil className="w-[12px] h-[12px] text-[#1A6FD4] ml-0.5" />
        </button>

        {pincodeOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%+6px)] rounded-2xl border border-[#E8EEF4] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-50 p-4">
            <div className="text-[14px] font-bold mb-1 text-[#1A1A2E]">Enter delivery pincode</div>
            <div className="text-[12.5px] mb-3 text-[#9CA3AF]">
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
                className="flex-1 rounded-lg border border-[#D0E3F7] px-3 py-2 text-[14px] text-[#1A1A2E] outline-none focus:border-[#1A6FD4]"
              />
              <button
                onClick={() => submitPincode(pincodeInput)}
                disabled={pincodeLoading}
                className="rounded-lg bg-[#1A6FD4] px-3 py-2 text-[13px] font-bold text-white transition-opacity disabled:opacity-60"
              >
                {pincodeLoading ? "..." : "Apply"}
              </button>
            </div>
            <button
              onClick={useMyLocation}
              disabled={ipDetectLoading}
              title="Use device location (asks for permission)"
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D0E3F7] px-3 py-2 text-[13px] font-bold text-[#1A6FD4] transition-opacity disabled:opacity-60"
            >
              <RotateCw className={`w-[13px] h-[13px] ${ipDetectLoading ? "animate-spin" : ""}`} />
              {ipDetectLoading ? "Detecting…" : "Use my location"}
            </button>
            {pincodeError && (
              <div className="mt-2 text-[12.5px] text-[#DC2626]">{pincodeError}</div>
            )}
            {(ipDetected || ipDetectError || ipDetectLoading) && (
              <div className="mt-3 rounded-lg border border-[#E8EEF4] bg-[#EAF2FF] p-2.5 text-[12px]">
                <div className="font-bold mb-0.5 text-[#4B5563]">Detection result</div>
                {ipDetectLoading ? (
                  <div className="text-[#9CA3AF]">Checking…</div>
                ) : ipDetectError ? (
                  <div className="text-[#DC2626]">{ipDetectError}</div>
                ) : ipDetected ? (
                  <div className="text-[#1A1A2E]">
                    {ipDetected.city}, {ipDetected.pincode}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Row 2: Logo + Icons ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/">
          <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA" width={80} height={28} priority style={{ objectFit: "contain" }} />
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
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-[#4338CA] text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <Link href="/account" className="relative flex items-center justify-center">
              <User className="w-[20px] h-[20px] text-[#4B5563]" />
            </Link>
          ) : (
            <button onClick={openLoginSheet} className="relative flex items-center justify-center">
              <User className="w-[20px] h-[20px] text-[#4B5563]" />
            </button>
          )}
        </div>
      </div>

      {/* ── Row 3: Elevated Search Bar ── */}
      <div className="px-4 py-2 pb-4" ref={searchRef}>
        <style>{`
          @keyframes searchHintIn {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .mobile-search-input { -webkit-tap-highlight-color: transparent; }
          .mobile-search-input:focus { outline: none !important; box-shadow: none !important; -webkit-appearance: none; }
          @keyframes voiceMicPulse {
            0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
            70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          .voice-mic-active {
            background: #EF4444;
            animation: voiceMicPulse 1.4s ease-out infinite;
          }
        `}</style>
        <div className="relative flex items-center gap-2.5 bg-white rounded-full px-4 py-2.5 shadow-sm border border-transparent focus-within:border-[#1A6FD4]/30 focus-within:shadow-md transition-all">
          <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
            <Image src={logoo} alt="Logo" width={26} height={26} className="object-cover" />
          </div>
          <div className="relative flex-1 min-w-0 h-[22px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
              onFocus={() => setShowSuggestions(true)}
              className="mobile-search-input absolute inset-0 w-full bg-transparent outline-none text-[15px] text-[#1A1A2E] placeholder:text-transparent border-0"
            />
            {!searchQuery && !voice.isListening && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden text-[15px] text-[#9CA3AF]">
                <span
                  key={placeholderIdx}
                  className="absolute inset-0 flex items-center truncate"
                  style={{ animation: "searchHintIn 500ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
                >
                  {SEARCH_PLACEHOLDERS[placeholderIdx]} ...
                </span>
              </div>
            )}
            {!searchQuery && voice.isListening && (
              <div className="pointer-events-none absolute inset-0 flex items-center text-[15px] font-medium text-[#EF4444] truncate">
                Listening…
              </div>
            )}
          </div>
          {showSuggestions && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          )}
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={voice.isListening ? "Stop voice search" : "Search by voice"}
            aria-pressed={voice.isListening}
            className={`shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full transition-colors ${
              voice.isListening ? "voice-mic-active" : "hover:bg-[#F3F4F6]"
            }`}
          >
            <Mic
              className={`w-[18px] h-[18px] ${
                voice.isListening ? "text-white" : "text-[#6B7280]"
              }`}
            />
          </button>
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
        <div className="flex items-center justify-around px-2 sm:px-3 border-b border-[#E5E7EB]">
          {MOBILE_TABS.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => router.push(`/?tab=${tab.key.toLowerCase()}`)}
                className="relative px-2 py-3 transition-colors"
                style={{ color: isActive ? tab.accent : "#6B7280" }}
              >
                <span className={`text-[11px] sm:text-[13px] font-bold tracking-wider whitespace-nowrap`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[3.5px] rounded-t-full"
                    style={{ backgroundColor: tab.accent, boxShadow: `0 -1px 4px ${tab.accent}50` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
