"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, History, Search, TrendingUp, X, Clock, Mic, MicOff } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductCard, { type Product } from "@/components/customer/ProductCard";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  seller_id: string;
  category_id?: string;
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

interface SearchResponse {
  data: SearchProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  category_name?: string;
  base_price: number;
}

const ACCENT = "#4338CA";
const TRENDING_PAGE_SIZE = 12;

function toCardProduct(p: SearchProduct): Product {
  return {
    id: p.id,
    name: p.name,
    seller: p.seller_name || "",
    category: p.category_name || "",
    originalPrice: p.base_price,
    price: p.sale_price ?? p.base_price,
    minOrder: p.min_order_qty
      ? `${p.min_order_qty} ${p.unit || "unit"}${p.min_order_qty > 1 ? "s" : ""}`
      : "Not specified",
    imageUrl: p.images?.[0] || undefined,
  };
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { items: recentlyViewed } = useRecentlyViewed();

  // Redirect desktop visitors to home — this page is mobile-only
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) router.replace("/");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) router.replace("/");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [router]);

  // ── Voice search state ──
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  // Auto-start if ?voice=1
  const voiceParam = searchParams?.get("voice");
  const voiceStarted = useRef(false);
  
  const attachToRecognition = useCallback((rec: any) => {
    recognitionRef.current = rec;
    setListening(true);
    
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      const current = final || interim;
      if (current) {
        setVoiceTranscript(current);
        handleQueryChange(current);
      }
      // Auto-submit on final result
      if (final.trim()) {
        setTimeout(() => submitSearch(final.trim()), 400);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    
    attachToRecognition(rec);

    try {
      rec.start();
    } catch {
      setListening(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachToRecognition]);

  useEffect(() => {
    if (voiceParam === "1" && !voiceStarted.current) {
      voiceStarted.current = true;
      
      const globalRec = (window as any)._globalVoiceRec;
      if (globalRec) {
        // Handoff from the home page click to bypass user-gesture requirement
        attachToRecognition(globalRec);
        delete (window as any)._globalVoiceRec;
      } else {
        // Fallback (e.g. page refreshed with ?voice=1)
        const id = setTimeout(() => startListening(), 300);
        return () => clearTimeout(id);
      }
    }
  }, [voiceParam, attachToRecognition, startListening]);

  const recentSearchesKey = useMemo(
    () => `recentSearches_${user?.id || "guest"}`,
    [user?.id]
  );

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Autocomplete (Elasticsearch via /api/search/autocomplete) ──
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestReqId = useRef(0);

  // ── Trending (infinite scroll) ──
  const [trending, setTrending] = useState<Product[]>([]);
  const [trendingPage, setTrendingPage] = useState(1);
  const [trendingTotalPages, setTrendingTotalPages] = useState(1);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Autofocus search input on mount
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(recentSearchesKey);
      setRecentSearches(saved ? JSON.parse(saved) : []);
    } catch {
      setRecentSearches([]);
    }
  }, [recentSearchesKey]);

  const persistRecentSearches = useCallback(
    (next: string[]) => {
      setRecentSearches(next);
      try {
        localStorage.setItem(recentSearchesKey, JSON.stringify(next));
      } catch {}
    },
    [recentSearchesKey]
  );

  const saveRecentSearch = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      const next = [t, ...recentSearches.filter((x) => x !== t)].slice(0, 5);
      persistRecentSearches(next);
    },
    [recentSearches, persistRecentSearches]
  );

  const removeRecentSearch = (term: string) => {
    persistRecentSearches(recentSearches.filter((x) => x !== term));
  };

  const clearAllRecentSearches = () => persistRecentSearches([]);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    const reqId = ++suggestReqId.current;
    setSuggestLoading(true);
    try {
      const res = await api.get<{ suggestions: Suggestion[] }>(
        `/api/search/autocomplete?q=${encodeURIComponent(q)}&limit=8`,
        { silent: true }
      );
      // Drop stale responses
      if (reqId !== suggestReqId.current) return;
      setSuggestions(res?.suggestions ?? []);
    } catch {
      if (reqId === suggestReqId.current) setSuggestions([]);
    } finally {
      if (reqId === suggestReqId.current) setSuggestLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      // Cancel any in-flight result and clear immediately
      suggestReqId.current++;
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const submitSearch = (raw: string) => {
    const term = raw.trim();
    if (!term) return;
    saveRecentSearch(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // ── Trending fetch ──
  const fetchTrending = useCallback(
    async (page: number) => {
      if (trendingLoading) return;
      if (page > 1 && page > trendingTotalPages) return;
      setTrendingLoading(true);
      try {
        const params = new URLSearchParams({
          sort: "ratings",
          page: String(page),
          limit: String(TRENDING_PAGE_SIZE),
        });
        const res = await api.get<SearchResponse>(
          `/api/search?${params.toString()}`,
          { silent: true }
        );
        if (!res) return;
        const next = (res.data ?? []).map(toCardProduct);
        setTrending((prev) => {
          if (page === 1) return next;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...next.filter((p) => !seen.has(p.id))];
        });
        setTrendingTotalPages(res.totalPages || 1);
        setTrendingPage(res.page || page);
      } catch {
        // silent — empty state will show
      } finally {
        setTrendingLoading(false);
      }
    },
    [trendingLoading, trendingTotalPages]
  );

  // Initial trending load
  useEffect(() => {
    fetchTrending(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (trendingLoading) return;
        if (trendingPage >= trendingTotalPages) return;
        fetchTrending(trendingPage + 1);
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trendingPage, trendingTotalPages, trendingLoading, fetchTrending]);

  const hasMoreTrending = trendingPage < trendingTotalPages;

  return (
    <div className="min-h-[100dvh]" style={{ background: t.bgPage }}>
      {/* ── Top bar with search ── */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: t.border }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            aria-label="Back to home"
            onClick={() => router.push("/")}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
          </button>
          <div
            className="flex-1 flex items-center gap-2 bg-[#F4F6FB] rounded-full px-4 h-10 border border-black/[0.15] focus-within:border-black/60 focus-within:bg-white transition-all duration-150"
            style={{ outline: "none" }}
          >
            <Search className="w-4 h-4 text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch(query);
              }}
              placeholder="Search for products, brands and more"
              className="flex-1 min-w-0 bg-transparent text-[14.5px] text-[#1A1A2E] placeholder:text-[#9CA3AF] outline-none ring-0 focus:outline-none focus:ring-0 [box-shadow:none!important] [-webkit-appearance:none]"
              style={{ WebkitTapHighlightColor: "transparent" }}
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => {
                  handleQueryChange("");
                  setVoiceTranscript("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[#9CA3AF] hover:text-[#1A1A2E]"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-5 bg-gray-300 mx-1" />

            {/* Mic button inside search bar */}
            <button
              type="button"
              aria-label={listening ? "Stop listening" : "Voice search"}
              onClick={() => listening ? stopListening() : startListening()}
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-all active:scale-90 mr-1"
              style={{
                background: listening ? "#4338CA" : "transparent",
                color: listening ? "white" : "#4338CA"
              }}
            >
              {listening
                ? <MicOff className="w-4 h-4" />
                : <Mic className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        {/* Listening indicator bar */}
        {listening && (
          <div className="flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: t.border, background: "#F5F3FF" }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4338CA] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4338CA]" />
            </span>
            <p className="text-[13px] font-semibold text-[#4338CA] flex-1">
              {voiceTranscript ? `"${voiceTranscript}"` : "Listening… speak now"}
            </p>
            <button
              onClick={stopListening}
              className="text-[11px] font-bold text-[#6B7280] hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── Autocomplete results (shown while typing) ── */}
      {query.trim().length > 0 && (
        <div className="bg-white">
          {query.trim().length < 2 ? (
            <div className="px-4 py-6 text-[13px] text-center" style={{ color: t.textMuted }}>
              Type at least 2 characters…
            </div>
          ) : suggestLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <div
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderColor: ACCENT }}
              />
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/products/${s.id}`}
                  onClick={() => saveRecentSearch(s.name)}
                  className="flex items-center gap-3 px-4 py-3 border-b transition-colors active:bg-[#F8FBFF]"
                  style={{ borderColor: t.border }}
                >
                  <Search className="w-4 h-4 shrink-0" style={{ color: t.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14.5px] truncate font-medium"
                      style={{ color: t.textPrimary }}
                    >
                      {s.name}
                    </p>
                    {s.category_name && (
                      <p className="text-[12px]" style={{ color: t.textMuted }}>
                        in {s.category_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => submitSearch(query)}
                className="w-full px-4 py-3.5 text-[14.5px] font-bold text-left transition-colors active:bg-[#F8FBFF]"
                style={{ color: ACCENT }}
              >
                Search for &quot;{query.trim()}&quot;
              </button>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-[14px] font-medium" style={{ color: t.textPrimary }}>
                No matches found
              </p>
              <button
                type="button"
                onClick={() => submitSearch(query)}
                className="mt-2 text-[13.5px] font-bold"
                style={{ color: ACCENT }}
              >
                Search anyway for &quot;{query.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Default sections (hidden while typing) ── */}
      {query.trim().length === 0 && (
      <>
      {/* ── Section 1: Recent Searches ── */}
      {recentSearches.length > 0 && (
        <section className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <History className="w-[15px] h-[15px]" style={{ color: t.textSecondary }} />
              <h2
                className="text-[12px] font-bold uppercase tracking-wider"
                style={{ color: t.textSecondary }}
              >
                Recent Searches
              </h2>
            </div>
            <button
              type="button"
              onClick={clearAllRecentSearches}
              className="text-[12px] font-bold hover:underline"
              style={{ color: ACCENT }}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full border bg-white"
                style={{ borderColor: t.border }}
              >
                <button
                  type="button"
                  onClick={() => submitSearch(term)}
                  className="text-[13px] font-medium"
                  style={{ color: t.textPrimary }}
                >
                  {term}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${term}`}
                  onClick={() => removeRecentSearch(term)}
                  className="ml-0.5 flex items-center justify-center w-5 h-5 rounded-full text-[#9CA3AF] hover:text-[#EF4444] hover:bg-gray-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 2: Recently Viewed Products ── */}
      {recentlyViewed.length > 0 && (
        <section className="pt-4 pb-2">
          <div className="px-4 flex items-center gap-2 mb-2.5">
            <Clock className="w-[15px] h-[15px]" style={{ color: t.textSecondary }} />
            <h2
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: t.textSecondary }}
            >
              Recently Viewed
            </h2>
          </div>
          <div className="overflow-x-auto overscroll-x-contain no-scrollbar">
            <div className="flex gap-3 px-4 pb-1">
              {recentlyViewed.map((item) => {
                const discount =
                  item.originalPrice > item.price && item.originalPrice > 0
                    ? Math.round(
                        ((item.originalPrice - item.price) / item.originalPrice) * 100
                      )
                    : 0;
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="shrink-0 w-[124px] rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-sm"
                    style={{ borderColor: t.border }}
                  >
                    <div className="relative w-full h-[124px] bg-[#F8FAFC]">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="124px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D1D5DB] text-[10px]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p
                        className="text-[12px] font-medium leading-tight line-clamp-2"
                        style={{ color: t.textPrimary }}
                      >
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span
                          className="text-[12.5px] font-bold"
                          style={{ color: t.textPrimary }}
                        >
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {discount > 0 && (
                          <span className="text-[10px] font-semibold" style={{ color: "#16A34A" }}>
                            {discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 3: Trending Products (infinite scroll) ── */}
      <section className="pt-4 pb-10">
        <div className="px-4 flex items-center gap-2 mb-3">
          <TrendingUp className="w-[15px] h-[15px]" style={{ color: t.textSecondary }} />
          <h2
            className="text-[12px] font-bold uppercase tracking-wider"
            style={{ color: t.textSecondary }}
          >
            Trending Products
          </h2>
        </div>

        {trending.length === 0 && trendingLoading ? (
          <div className="grid grid-cols-2 gap-1.5 px-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border"
                style={{ background: "#F3F4F6", borderColor: t.border, height: 280 }}
              />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div
            className="mx-4 rounded-2xl border p-6 text-center text-[13px]"
            style={{ borderColor: t.border, color: t.textMuted }}
          >
            No trending products right now. Check back soon.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 px-1.5">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Sentinel + loader */}
            <div ref={sentinelRef} className="h-10 w-full" />
            {trendingLoading && trending.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div
                  className="animate-spin rounded-full h-6 w-6 border-b-2"
                  style={{ borderColor: ACCENT }}
                />
              </div>
            )}
            {!hasMoreTrending && (
              <div
                className="text-center text-[12px] py-4"
                style={{ color: t.textMuted }}
              >
                You&apos;re all caught up
              </div>
            )}
          </>
        )}
      </section>
      </>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        /* Kill browser blue focus glow on search input */
        input[type="text"]:focus { outline: none !important; box-shadow: none !important; }
        input:-webkit-autofill { box-shadow: 0 0 0 1000px #fff inset !important; -webkit-text-fill-color: #1A1A2E !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

export default function SearchExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 flex justify-center items-center">
          <div
            className="animate-spin rounded-full h-7 w-7 border-b-2"
            style={{ borderColor: ACCENT }}
          />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
