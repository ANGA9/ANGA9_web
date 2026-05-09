"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import logoo from "@/assets/logoo.png";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { User, MapPin, Search, Heart, ShoppingCart, Pencil, Mic, X, Loader2 } from "lucide-react";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { cdnUrl } from "@/lib/utils";
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
  const [detectedLocality, setDetectedLocality] = useState("");
  const [isClosingSheet, setIsClosingSheet] = useState(false);
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

  const pincodeInputRef = useRef<HTMLInputElement>(null);

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

  const lookupPincode = useCallback(async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) return;
    setPincodeError("");
    setPincodeLoading(true);
    setDetectedLocality("");
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
      const locality = office.Name;
      const state = office.State;
      setDetectedLocality(`${locality}, ${city}, ${state}`);
      const next = { city, pincode: pin };
      setLocation(next);
      try {
        localStorage.setItem("userPincode", JSON.stringify(next));
      } catch {}
      // Auto-close after a brief moment so user sees the result
      setTimeout(() => closeSheet(), 800);
    } catch {
      setPincodeError("Could not look up pincode. Try again.");
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  const handlePincodeChange = (raw: string) => {
    const val = raw.replace(/\D/g, "").slice(0, 6);
    setPincodeInput(val);
    setPincodeError("");
    setDetectedLocality("");
    if (val.length === 6) {
      lookupPincode(val);
    }
  };

  const openSheet = () => {
    setIsClosingSheet(false);
    setPincodeInput("");
    setPincodeError("");
    setDetectedLocality("");
    setPincodeOpen(true);
    setTimeout(() => pincodeInputRef.current?.focus(), 100);
  };

  const closeSheet = useCallback(() => {
    setIsClosingSheet(true);
    setTimeout(() => {
      setPincodeOpen(false);
      setIsClosingSheet(false);
    }, 250);
  }, []);


      
  // Hide the home header on dedicated sub-pages
  if (pathname === "/account" || pathname === "/cart") return null;

  return (
    <div
      className="w-full relative transition-all duration-500"
      style={{ background: `linear-gradient(to bottom, ${activeTabConfig.gradientFrom}, ${activeTabConfig.gradientVia}, #ffffff)` }}
    >
      {/* ── Row 1: Delivery Location ── */}
      <div className="px-4 pt-4 pb-1 w-full" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 12px))' }}>
        <button
          onClick={openSheet}
          className="flex items-center gap-1.5 group active:opacity-70 transition-opacity"
        >
          <MapPin className="w-4 h-4 text-[#1A6FD4] stroke-[2.5] shrink-0" />
          <span className="text-[13px] font-medium text-[#4B5563] tracking-tight">Deliver to</span>
          <span className="text-[13px] font-bold text-[#1A1A2E] tracking-tight truncate">
            {location ? `${location.city}, ${location.pincode}` : "Set Pincode"}
          </span>
          <Pencil className="w-3 h-3 text-[#1A6FD4] shrink-0 ml-0.5" />
        </button>
      </div>

      {/* ── Pincode Bottom Sheet (mobile + desktop) ── */}
      {pincodeOpen && (
        <>
          <style>{`
            @keyframes sheetUp {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
            @keyframes sheetDown {
              from { transform: translateY(0); }
              to   { transform: translateY(100%); }
            }
            @keyframes overlayFadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes overlayFadeOut { from { opacity: 1; } to { opacity: 0; } }
          `}</style>
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end md:justify-center md:items-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              style={{ animation: `${isClosingSheet ? 'overlayFadeOut' : 'overlayFadeIn'} 200ms ease forwards` }}
              onClick={closeSheet}
            />
            {/* Sheet */}
            <div
              className="relative bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[420px] flex flex-col"
              style={{
                animation: `${isClosingSheet ? 'sheetDown 250ms ease-in forwards' : 'sheetUp 280ms cubic-bezier(0.22,1,0.36,1)'}`,
                boxShadow: '0 -8px 30px rgba(0,0,0,0.1)',
                marginBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {/* Grabber (mobile) */}
              <div className="md:hidden flex justify-center pt-2 pb-1">
                <span className="block w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 md:pt-5 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900">Enter delivery pincode</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">We'll show prices and delivery times for your area</p>
                </div>
                <button onClick={closeSheet} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 6 Digit Boxes */}
              <div className="px-5 pt-6 pb-8">
                <div className="flex items-center justify-center gap-2.5">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`pin-${idx}`}
                      ref={idx === 0 ? pincodeInputRef : undefined}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={pincodeInput[idx] || ""}
                      autoFocus={idx === 0}
                      onChange={(e) => {
                        const digit = e.target.value.replace(/\D/g, "").slice(-1);
                        const arr = pincodeInput.split("");
                        arr[idx] = digit;
                        // Fill gaps with empty string
                        while (arr.length < 6) arr.push("");
                        const newVal = arr.join("").replace(/[^0-9]/g, "").slice(0, 6);
                        handlePincodeChange(newVal);
                        // Auto-focus next box
                        if (digit && idx < 5) {
                          const next = document.getElementById(`pin-${idx + 1}`) as HTMLInputElement;
                          next?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !pincodeInput[idx] && idx > 0) {
                          const prev = document.getElementById(`pin-${idx - 1}`) as HTMLInputElement;
                          prev?.focus();
                          const arr = pincodeInput.split("");
                          arr[idx - 1] = "";
                          handlePincodeChange(arr.join("").replace(/[^0-9]/g, ""));
                        }
                      }}
                      className="w-11 h-12 md:w-12 md:h-14 rounded-xl border-2 text-center text-[18px] md:text-[20px] font-bold text-gray-900 outline-none transition-all focus:border-[#1A1A2E] focus:shadow-[0_0_0_3px_rgba(26,26,46,0.08)]"
                      style={{
                        borderColor: pincodeError
                          ? '#DC2626'
                          : pincodeInput[idx]
                            ? '#1A1A2E'
                            : '#E5E7EB',
                        background: pincodeInput[idx] ? '#F9FAFB' : '#FFFFFF',
                      }}
                    />
                  ))}
                </div>

                {/* Loading */}
                {pincodeLoading && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-[12px] text-gray-400 font-medium">Looking up pincode...</span>
                  </div>
                )}

                {/* Error */}
                {pincodeError && (
                  <p className="mt-3 text-[12.5px] font-medium text-red-600 text-center">{pincodeError}</p>
                )}

                {/* Detected locality */}
                {detectedLocality && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                    <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-[13px] font-semibold text-green-800">{detectedLocality}</p>
                  </div>
                )}

                {/* Helper text */}
                <p className="mt-4 text-[11px] text-gray-400 text-center">
                  Type your pincode and we'll detect your locality automatically
                </p>
              </div>
            </div>
          </div>
        </>
      )}

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
        <div className="relative flex items-center bg-white rounded-full shadow-sm border border-[#1A1A2E]/15 hover:border-[#1A1A2E]/40 transition-all">
          <button
            type="button"
            onClick={() => router.push("/search/explore")}
            aria-label="Open search"
            className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-l-full text-left bg-transparent"
          >
            <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
              <Image src={logoo} alt="Logo" width={26} height={26} className="object-cover" />
            </div>
            <div className="relative flex-1 min-w-0 h-[22px]">
              <div className="pointer-events-none absolute inset-0 overflow-hidden text-[15px] text-[#6B7280]">
                <span
                  key={placeholderIdx}
                  className="absolute inset-0 flex items-center truncate"
                  style={{ animation: "searchHintIn 500ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
                >
                  {SEARCH_PLACEHOLDERS[placeholderIdx]} ...
                </span>
              </div>
            </div>
            <Search className="w-[18px] h-[18px] text-[#4B5563] shrink-0 ml-1" />
          </button>

          <div className="shrink-0 flex items-center pr-3">
            <div className="w-px h-5 bg-gray-200 mx-2" />
            {/* Mic button — right inside of search bar */}
            <button
              type="button"
              onClick={() => {
                const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (SR) {
                  const rec = new SR();
                  rec.lang = "en-IN";
                  rec.continuous = false;
                  rec.interimResults = true;
                  rec.maxAlternatives = 1;
                  (window as any)._globalVoiceRec = rec;
                  try { rec.start(); } catch {}
                }
                router.push("/search/explore?voice=1");
              }}
              aria-label="Voice search"
              className="p-1.5 rounded-full text-[#4338CA] hover:bg-gray-100 transition-colors active:scale-95"
            >
              <Mic className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
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
