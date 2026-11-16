"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  MapPin,
  LocateFixed,
  Loader2,
  Building2,
  CheckCircle2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { detectLocationFromBrowser, type DetectedLocation } from "@/lib/detectLocation";
import { useLoginSheet } from "@/lib/LoginSheetContext";

interface SavedAddress {
  id: string;
  label?: string;
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode: string;
  is_default?: boolean;
}

interface LocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: DetectedLocation | null;
  onSelectLocation: (loc: DetectedLocation) => void;
  isLoggedIn: boolean;
}

export default function LocationDrawer({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  isLoggedIn,
}: LocationDrawerProps) {
  const router = useRouter();
  const { open: openLoginSheet } = useLoginSheet();

  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Sync / Reset on open
  useEffect(() => {
    if (isOpen) {
      setPincodeInput(currentLocation?.pincode || "");
      setPincodeError("");
      setGeoError("");

      if (isLoggedIn) {
        setLoadingAddresses(true);
        api.get<{ addresses?: SavedAddress[]; data?: SavedAddress[] }>("/api/users/addresses", { silent: true })
          .then((res) => {
            setSavedAddresses(res?.addresses || res?.data || []);
          })
          .catch(() => setSavedAddresses([]))
          .finally(() => setLoadingAddresses(false));
      }
    }
  }, [isOpen, isLoggedIn, currentLocation]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Check manual 6-digit pincode
  const handleCheckPincode = async () => {
    const pin = pincodeInput.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    setPincodeLoading(true);
    setPincodeError("");
    try {
      const res = await fetch(`/postal-proxy/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        const entry = data?.[0];
        if (entry?.Status === "Success" && entry.PostOffice?.length) {
          const office = entry.PostOffice[0];
          const city = office.District || office.Name || "Delivery Location";
          const next = { city, pincode: pin };
          onSelectLocation(next);
          onClose();
          return;
        }
      }
      // If postal-proxy did not return success, check if we can still set it or show error
      setPincodeError("Pincode not found. Please verify and try again.");
    } catch {
      // Offline / network fallback: allow 6-digit pincode
      const next = { city: "Delivery Location", pincode: pin };
      onSelectLocation(next);
      onClose();
    } finally {
      setPincodeLoading(false);
    }
  };

  // Detect using GPS / Ola Maps
  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    setGeoError("");
    try {
      const next = await detectLocationFromBrowser();
      if (next?.city) {
        onSelectLocation(next);
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setGeoError(e?.message || "Could not detect location. Please check browser permissions.");
    } finally {
      setGeoLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[120] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Right Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[121] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Delivery Location"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Choose your location</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select delivery location to see product availability
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Box 1: Pincode Input + Blue Check Button */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Enter delivery pincode
            </label>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <input
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
                    if (e.key === "Enter") handleCheckPincode();
                  }}
                  placeholder="Enter 6-digit pincode"
                  className={cn(
                    "w-full h-11 px-3.5 rounded-lg border text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-1",
                    pincodeError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:border-[#1A6FD4] focus:ring-[#1A6FD4]"
                  )}
                />
              </div>
              <button
                type="button"
                onClick={handleCheckPincode}
                disabled={pincodeLoading || pincodeInput.length !== 6}
                className="h-11 px-5 rounded-lg bg-[#1A6FD4] hover:bg-[#155bb5] active:bg-[#0f4ca3] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:shadow"
              >
                {pincodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
              </button>
            </div>
            {pincodeError && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{pincodeError}</p>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-semibold select-none">
              OR
            </span>
          </div>

          {/* Box 2: Use current location button */}
          <div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 active:bg-blue-100/70 transition-all text-left cursor-pointer group disabled:opacity-60"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A6FD4]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1A6FD4]/20 transition-colors">
                {geoLoading ? (
                  <Loader2 className="w-5 h-5 text-[#1A6FD4] animate-spin" />
                ) : (
                  <LocateFixed className="w-5 h-5 text-[#1A6FD4] group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A6FD4]">
                  {geoLoading ? "Detecting location…" : "Use current location"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Using device GPS for accurate delivery
                </p>
              </div>
            </button>
            {geoError && (
              <p className="text-xs text-red-500 font-medium mt-2 px-1">{geoError}</p>
            )}
          </div>

          {/* Section 3: Saved addresses */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-bold text-gray-900 tracking-tight">Saved addresses</h4>
              </div>
              {isLoggedIn && savedAddresses.length > 0 && (
                <Link
                  href="/account"
                  onClick={onClose}
                  className="text-xs font-semibold text-[#1A6FD4] hover:underline cursor-pointer"
                >
                  + Add new
                </Link>
              )}
            </div>

            {/* If Logged In */}
            {isLoggedIn ? (
              loadingAddresses ? (
                <div className="space-y-2.5">
                  <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                </div>
              ) : savedAddresses.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {savedAddresses.map((addr) => {
                    const isSelected =
                      currentLocation?.pincode === addr.pincode &&
                      (currentLocation?.city?.toLowerCase() === addr.city?.toLowerCase() || !addr.city);
                    const addrLine = [addr.line1, addr.line2, addr.city, addr.state]
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          const city = addr.city || addr.state || "Delivery Location";
                          const pincode = addr.pincode || "";
                          onSelectLocation({ city, pincode });
                          onClose();
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 group",
                          isSelected
                            ? "border-[#1A6FD4] bg-blue-50/40 ring-1 ring-[#1A6FD4]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {addr.label || "HOME"}
                            </span>
                            {addr.name && (
                              <span className="text-xs font-semibold text-gray-900 truncate">
                                {addr.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {addrLine} - <span className="font-semibold text-gray-900">{addr.pincode}</span>
                          </p>
                        </div>
                        <div className="shrink-0 mt-0.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-[#1A6FD4] fill-[#1A6FD4] text-white" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-gray-200 text-center bg-gray-50/50">
                  <p className="text-xs text-gray-500 mb-2">No saved addresses found</p>
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="inline-block text-xs font-semibold text-[#1A6FD4] hover:underline"
                  >
                    + Add a new address
                  </Link>
                </div>
              )
            ) : (
              /* If NOT Logged In: Show "Login first" */
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/70 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1A6FD4] mx-auto flex items-center justify-center mb-2.5">
                  <User className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Login to view saved addresses</p>
                <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                  Sign in to access your saved delivery addresses and faster checkout.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (openLoginSheet) {
                      openLoginSheet();
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#1A6FD4] hover:bg-[#155bb5] active:bg-[#0f4ca3] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Login first
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer: Current location status */}
        {currentLocation && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-4 h-4 text-[#1A6FD4] shrink-0" />
            <span className="truncate">
              Currently delivering to:{" "}
              <strong className="text-gray-900 font-semibold">
                {currentLocation.city}
                {currentLocation.pincode ? `, ${currentLocation.pincode}` : ""}
              </strong>
            </span>
          </div>
        )}
      </div>
    </>
  );
}

