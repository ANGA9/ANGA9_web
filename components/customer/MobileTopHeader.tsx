"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logoo from "@/assets/logoo.png";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { User, MapPin, Search, Heart, ShoppingCart, RotateCw, Pencil } from "lucide-react";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { cdnUrl } from "@/lib/utils";
import { detectLocationFromBrowser } from "@/lib/detectLocation";
import NotificationBell from "@/components/shared/NotificationBell";

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

  const pincodeRef = useRef<HTMLDivElement>(null);

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
      
  // Hide the home header on dedicated sub-pages
  if (pathname === "/account" || pathname === "/cart") return null;

  return (
    <div
      className="w-full relative transition-all duration-500"
      style={{ background: `linear-gradient(to bottom, ${activeTabConfig.gradientFrom}, ${activeTabConfig.gradientVia}, #ffffff)` }}
    >
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

      {/* ── Row 3: Elevated Search Bar (taps open /search/explore) ── */}
      <div className="px-4 py-2 pb-4">
        <style>{`
          @keyframes searchHintIn {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <button
          type="button"
          onClick={() => router.push("/search/explore")}
          aria-label="Open search"
          className="w-full relative flex items-center gap-2.5 bg-white rounded-full px-4 py-2.5 shadow-sm border border-transparent transition-all text-left"
        >
          <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
            <Image src={logoo} alt="Logo" width={26} height={26} className="object-cover" />
          </div>
          <div className="relative flex-1 min-w-0 h-[22px]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden text-[15px] text-[#9CA3AF]">
              <span
                key={placeholderIdx}
                className="absolute inset-0 flex items-center truncate"
                style={{ animation: "searchHintIn 500ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
              >
                {SEARCH_PLACEHOLDERS[placeholderIdx]} ...
              </span>
            </div>
          </div>
          <Search className="w-[18px] h-[18px] text-[#6B7280] shrink-0" />
        </button>
      </div>

      {/* ── Row 4: Folder Tabs (hidden on search results) ── */}
      {pathname !== "/search" && (
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
      )}
    </div>
  );
}
