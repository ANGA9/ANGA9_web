"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, MapPin, ChevronDown, Search, Mic, HandHeart, Heart, ShoppingCart } from "lucide-react";
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
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
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
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-lg border py-1 overflow-hidden"
              style={{
                background: "#FFFFFF",
                borderColor: t.border,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                zIndex: 60,
              }}
            >
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/products/${s.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F8FBFF]"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base truncate" style={{ color: t.textPrimary }}>
                      {s.name}
                    </p>
                    {s.category_name && (
                      <p className="text-xs md:text-sm" style={{ color: t.textMuted }}>
                        {s.category_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSearchSubmit}
                className="w-full px-4 py-2 text-xs md:text-sm font-medium text-left border-t transition-colors hover:bg-[#F8FBFF]"
                style={{ borderColor: t.border, color: t.bluePrimary }}
              >
                Search for &quot;{searchQuery}&quot;
              </button>
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
              className="shrink-0 flex items-center h-10 px-3 text-xs md:text-sm font-medium whitespace-nowrap"
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
