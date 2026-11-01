"use client";

import { useState, useRef, useEffect, useCallback, useTransition, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import logoo from "@/assets/logoo.png";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { User, MapPin, Search, Heart, ShoppingCart, Pencil, Mic, X, Loader2, LocateFixed, Map, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLoginSheet } from "@/lib/LoginSheetContext";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { cdnUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { getBrowserPosition, reverseGeocode } from "@/lib/olaMaps";
import NotificationBell from "@/components/shared/NotificationBell";

const MOBILE_TABS: { key: string; label: string; accent: string; gradientFrom: string; gradientVia: string }[] = [
  { key: "ALL",          label: "ALL",          accent: "#1A6FD4", gradientFrom: "#BAD8FF", gradientVia: "#E2EFFF" },
  { key: "FASHION",      label: "FASHION",      accent: "#E0598B", gradientFrom: "#F9BFD4", gradientVia: "#FDE2EC" },
  { key: "ACCESSORIES",  label: "ACCESSORIES",  accent: "#8B5CF6", gradientFrom: "#D7CBFD", gradientVia: "#ECE5FE" },
  { key: "HOME LIVING",  label: "HOME LIVING",  accent: "#2E9D6A", gradientFrom: "#C0EDD5", gradientVia: "#E1F7EC" },
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

  const [isPending, startTransition] = useTransition();
  const [loadingDots, setLoadingDots] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isPending) {
      const id = setInterval(() => {
        setLoadingDots((d) => d.length >= 3 ? "" : d + ".");
      }, 400);
      return () => clearInterval(id);
    } else {
      setLoadingDots("");
    }
  }, [isPending]);

  const [location, setLocation] = useState<{ city: string; pincode: string } | null>(null);
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [detectedLocality, setDetectedLocality] = useState("");
  const [isClosingSheet, setIsClosingSheet] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const SEARCH_WORDS = [
    "accessories",
    "formal shirts",
    "home decor",
    "footwear",
    "kitchenware",
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [SEARCH_WORDS.length]);

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

  // Fetch saved addresses if logged in when sheet opens
  useEffect(() => {
    if (pincodeOpen && isLoggedIn) {
      setLoadingAddresses(true);
      api.get<{ addresses?: any[]; data?: any[] }>("/api/users/addresses", { silent: true })
        .then((res) => {
          setSavedAddresses(res?.addresses || res?.data || []);
        })
        .catch(() => {
          setSavedAddresses([]);
        })
        .finally(() => {
          setLoadingAddresses(false);
        });
    }
  }, [pincodeOpen, isLoggedIn]);

  const lookupPincode = useCallback(async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) return;
    setPincodeError("");
    setPincodeLoading(true);
    setDetectedLocality("");
    try {
      // Proxied through our Next.js route — upstream's TLS cert is expired.
      const res = await fetch(`/postal-proxy/pincode/${pin}`);
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
      setTimeout(() => closeSheet(), 800);
    } catch {
      setPincodeError("Could not look up pincode. Try again.");
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  const handleCurrentLocation = async () => {
    setGeoLoading(true);
    setPincodeError("");
    try {
      const pos = await getBrowserPosition();
      const detected = await reverseGeocode(pos.lat, pos.lng);
      const city = detected.city || detected.state || "My Location";
      const pincode = detected.pincode || "";
      const next = { city, pincode };
      setLocation(next);
      if (pincode) {
        try {
          localStorage.setItem("userPincode", JSON.stringify(next));
        } catch {}
      }
      closeSheet();
    } catch {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
              );
              const data = await res.json();
              const city = data.locality || data.city || data.principalSubdivision || "Current Location";
              const pincode = data.postcode || "";
              const next = { city, pincode };
              setLocation(next);
              if (pincode) {
                try {
                  localStorage.setItem("userPincode", JSON.stringify(next));
                } catch {}
              }
              closeSheet();
            } catch {
              setPincodeError("Could not detect location. Please enter pincode.");
            } finally {
              setGeoLoading(false);
            }
          },
          () => {
            setGeoLoading(false);
            setPincodeError("Location permission denied. Please enter pincode.");
          },
          { timeout: 8000 }
        );
        return;
      }
      setPincodeError("Could not detect location. Please enter pincode.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSearchLocation = () => {
    if (!isLoggedIn) {
      closeSheet();
      openLoginSheet();
      return;
    }
    closeSheet();
    router.push("/account");
  };

  const handleSelectAddress = (addr: any) => {
    const city = addr.city || addr.state || "Delivery Location";
    const pincode = addr.pincode || "";
    const next = { city, pincode };
    setLocation(next);
    try {
      localStorage.setItem("userPincode", JSON.stringify(next));
    } catch {}
    closeSheet();
  };

  const openSheet = () => {
    setIsClosingSheet(false);
    setPincodeInput(location?.pincode || "");
    setPincodeError("");
    setDetectedLocality("");
    setPincodeOpen(true);
    setTimeout(() => pincodeInputRef.current?.focus(), 150);
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

      {/* ── Delivery Location Bottom Sheet (mobile + desktop) ── */}
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
              className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:w-[440px] flex flex-col max-h-[85vh] overflow-hidden"
              style={{
                animation: `${isClosingSheet ? 'sheetDown 250ms ease-in forwards' : 'sheetUp 280ms cubic-bezier(0.22,1,0.36,1)'}`,
                boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
                marginBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {/* Grabber */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="block w-10 h-1.5 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100">
                <h3 className="text-[17px] font-bold text-[#111827]">Select Delivery Location</h3>
                <button
                  onClick={closeSheet}
                  className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-5 py-4 overflow-y-auto space-y-3.5">
                {/* Pincode Input Box with "Check Pincode" */}
                <div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus-within:border-[#1A6FD4] focus-within:ring-1 focus-within:ring-[#1A6FD4] transition-all">
                    <input
                      ref={pincodeInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setPincodeInput(val);
                        setPincodeError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && pincodeInput.length === 6) {
                          lookupPincode(pincodeInput);
                        }
                      }}
                      placeholder="Enter Pincode"
                      className="w-full text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pincodeInput.length === 6) {
                          lookupPincode(pincodeInput);
                        } else {
                          setPincodeError("Please enter a valid 6-digit pincode");
                        }
                      }}
                      disabled={pincodeLoading}
                      className="text-[13px] font-semibold text-[#1A6FD4] hover:text-[#155bb5] active:opacity-70 whitespace-nowrap pl-3 shrink-0"
                    >
                      {pincodeLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#1A6FD4]" /> : "Check Pincode"}
                    </button>
                  </div>
                  {pincodeError && (
                    <p className="text-[12px] font-medium text-red-500 mt-1.5 px-1">{pincodeError}</p>
                  )}
                  {detectedLocality && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2">
                      <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-[12.5px] font-semibold text-green-800">{detectedLocality}</p>
                    </div>
                  )}
                </div>

                {/* Action 1: Use my current location */}
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  disabled={geoLoading}
                  className="w-full flex items-center justify-between py-2 text-left group active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <LocateFixed className="w-5 h-5 text-[#1A6FD4] shrink-0" />
                    <span className="text-[14px] font-medium text-[#1A6FD4]">
                      {geoLoading ? "Detecting location..." : "Use my current location"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1A6FD4] shrink-0" />
                </button>

                {/* Action 2: Search location */}
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  className="w-full flex items-center justify-between py-2 text-left group active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-[#1A6FD4] shrink-0" />
                    <span className="text-[14px] font-medium text-[#1A6FD4]">Search location</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1A6FD4] shrink-0" />
                </button>

                {/* Divider with centered 'Or' & Saved Addresses — ONLY if logged in */}
                {isLoggedIn && (
                  <>
                    <div className="relative py-2 flex items-center justify-center">
                      <div className="w-full border-t border-gray-200" />
                      <span className="absolute bg-white px-3 text-[13px] font-medium text-gray-500">Or</span>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-bold text-[#111827] mb-2.5">Select Saved Address</h4>

                      {loadingAddresses ? (
                        <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#1A6FD4]" />
                          <span className="text-[13px]">Loading addresses...</span>
                        </div>
                      ) : savedAddresses.length === 0 ? (
                        <p className="text-[12.5px] text-gray-400 py-2">No saved addresses found.</p>
                      ) : (
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {savedAddresses.map((addr) => {
                            const isSelected = location?.pincode === addr.pincode;
                            const titleName = addr.receiver_name || user?.user_metadata?.full_name || "Address";
                            const addrLine = [addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(", ");
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectAddress(addr)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? "border-[#1A6FD4] bg-[#F0F7FF]/50"
                                    : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[13.5px] font-bold text-gray-900">
                                        {titleName}, {addr.pincode}
                                      </span>
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {addr.label || "HOME"}
                                      </span>
                                    </div>
                                    <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                      {addrLine}
                                    </p>
                                  </div>
                                </div>
                                <div className="shrink-0 mt-0.5">
                                  {isSelected ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#1A6FD4] fill-[#1A6FD4] text-white" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-300" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
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
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold bg-[#1A6FD4] text-white">
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

      {/* ── Row 3: Elevated Search Bar + Standalone Circular Mic ── */}
      <div className="px-4 py-2 pb-4 flex items-center gap-2.5">
        <style>{`
          @keyframes searchHintIn {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Search Pill */}
        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              router.push("/search/explore");
            });
          }}
          aria-label="Open search"
          className="flex-1 relative flex items-center gap-2.5 px-4 h-[48px] bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/15 hover:border-[#1A1A2E]/40 transition-all text-left"
        >
          <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
            <Image src={logoo} alt="Logo" width={26} height={26} className="object-cover" />
          </div>
          <div className="relative flex-1 min-w-0 h-[22px]">
            <div className="pointer-events-none absolute inset-0 flex items-center text-[14.5px] text-[#6B7280]">
              {isPending ? (
                <span className="font-medium text-[#6B7280]">Loading{loadingDots}</span>
              ) : (
                <>
                  <span className="shrink-0 select-none text-[#6B7280]">Search for&nbsp;</span>
                  <div className="relative flex-1 min-w-0 h-[22px] overflow-hidden">
                    <span
                      key={placeholderIdx}
                      className="absolute inset-0 flex items-center truncate text-[#374151] font-medium"
                      style={{ animation: "searchHintIn 450ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
                    >
                      &apos;{SEARCH_WORDS[placeholderIdx]}&apos;
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Search className="w-[18px] h-[18px] text-[#4B5563] shrink-0" />
        </button>

        {/* Standalone Circular Mic Button */}
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
          className="shrink-0 flex items-center justify-center w-[48px] h-[48px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#1A1A2E]/15 hover:border-[#1A1A2E]/40 text-[#1A6FD4] active:scale-95 transition-all"
        >
          <Mic className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* ── Row 4: Folder Tabs (hidden on search results) ── */}
      {pathname !== "/search" && (
      <div className={`w-full bg-transparent transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-[60px] opacity-100 pt-1"}`}>
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
