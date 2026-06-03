"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Loader2, CreditCard, PackageOpen, MapPin, ChevronDown, AlertTriangle, ArrowLeft, Plus, X, Save, CheckCircle2, Ticket } from "lucide-react";
import Link from "next/link";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { usePayment, type PaymentMethod } from "@/lib/usePayment";
import { PaymentMethodPicker } from "@/components/customer/checkout/PaymentMethodPicker";
import toast from "react-hot-toast";

interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const EMPTY_FORM: Omit<Address, "id" | "is_default"> = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-all";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, loading } = useCart();
  const { user, dbUser } = useAuth();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [cartWarnings, setCartWarnings] = useState<string[]>([]);
  const [cartBlocked, setCartBlocked] = useState(false);
  const [validating, setValidating] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Surfaced to the picker so a failed attempt's row gets dimmed with a hint.
  const [lastFailed, setLastFailed] = useState<{ method: PaymentMethod; reason: string } | null>(null);

  // Promos
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; discount_type: string; discount_value: number; max_discount: number | null } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);

  // Inline address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  // Validate cart against actual product status in Supabase
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post<{ valid?: boolean; warnings?: string[]; items?: { productId: string; name: string; available: boolean }[] }>(
          "/api/cart/validate", {}, { silent: true }
        );
        const warnings: string[] = [];
        let blocked = false;

        // Check actual item availability from validated response
        if (res?.items?.length) {
          const unavailableItems = res.items.filter(item => !item.available);
          if (unavailableItems.length > 0) {
            blocked = true;
            unavailableItems.forEach(item => {
              warnings.push(`"${item.name}" is currently unavailable.`);
            });
          }
        }

        // Only show warnings if validation actually found issues
        if (res?.valid === false && warnings.length === 0 && res?.warnings?.length) {
          warnings.push(...res.warnings);
          blocked = true;
        }

        setCartWarnings(warnings);
        setCartBlocked(blocked);
      } catch { /* ignore — allow checkout if validation endpoint fails */ }
      setValidating(false);
    })();
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get<{ addresses?: Address[]; data?: Address[] }>("/api/users/addresses", { silent: true });
      const list = res?.addresses || res?.data || [];
      setAddresses(list);
      // Auto-select: prefer default address, then first one
      const def = list.find((a) => a.is_default) || list[0];
      if (def) setSelectedAddressId(def.id);
    } catch { /* ignore */ }
    setLoadingAddresses(false);
  };

  useEffect(() => {
    fetchAddresses();
    api.get<{ balance: number }>("/api/users/me/coins", { silent: true })
      .then(res => { if (res?.balance) setCoinBalance(res.balance); })
      .catch(() => {});
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const hasAddress = !!selectedAddress;

  const subtotal = items.reduce(
    (sum, item) => sum + (item.sale_price ?? item.base_price) * item.qty,
    0
  );
  
  let couponDiscount = appliedCoupon?.discount || 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      // Match the server's 2-decimal (paise) rounding so the UI total agrees
      // with what apply_promos_to_order computes server-side.
      couponDiscount = Math.round((subtotal * appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount !== null) couponDiscount = Math.min(couponDiscount, appliedCoupon.max_discount);
    } else {
      couponDiscount = Math.min(appliedCoupon.discount_value, subtotal);
    }
  }

  const afterCoupon = subtotal - couponDiscount;
  const gst = Math.round(afterCoupon * 0.18);
  const delivery = afterCoupon > 10000 ? 0 : 500;
  const totalBeforeCoins = afterCoupon + gst + delivery;

  const maxCoinsAllowed = Math.min(coinBalance, Math.floor(totalBeforeCoins));
  const actualCoinsUsed = Math.min(coinsToUse, maxCoinsAllowed);

  const total = totalBeforeCoins - actualCoinsUsed;

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please refresh.");
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script — it should persist
    };
  }, []);

  // ── Promo handlers ──
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await api.post<{ valid: boolean; message?: string; discount?: number; discount_type?: string; discount_value?: number; max_discount?: number | null }>(
        "/api/orders/coupon/validate",
        { code: couponCode, subtotal }
      );
      if (res.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: res.discount || 0,
          discount_type: res.discount_type || '',
          discount_value: res.discount_value || 0,
          max_discount: res.max_discount ?? null,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast.success("Coupon applied!");
      } else {
        setCouponError(res.message || "Invalid coupon");
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // ── Inline address form handlers ──
  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setShowAddressForm(true);
    setShowAddressPicker(false);
  };

  const handleSaveAddress = async () => {
    if (!form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    setSavingAddress(true);
    try {
      await api.post("/api/users/addresses", form);
      toast.success("Address added successfully!");
      setShowAddressForm(false);
      setForm(EMPTY_FORM);
      // Refresh addresses and auto-select the newest one
      const res = await api.get<{ addresses?: Address[]; data?: Address[] }>("/api/users/addresses", { silent: true });
      const list = res?.addresses || res?.data || [];
      setAddresses(list);
      // Select the newly added address (last in list, or the one with highest id)
      if (list.length > 0) {
        // Try to find the new one (it won't be in old addresses)
        const oldIds = new Set(addresses.map(a => a.id));
        const newAddr = list.find(a => !oldIds.has(a.id));
        setSelectedAddressId(newAddr?.id || list[list.length - 1].id);
      }
    } catch {
      toast.error("Failed to save address");
    }
    setSavingAddress(false);
  };

  // ── Payment hook ──
  // All Razorpay choreography lives in usePayment now: build display.blocks
  // for brand-specific preselection, open the modal, verify, etc. COD
  // short-circuits before Razorpay. The hook does NOT cancel the order on
  // dismiss — the server-side pendingOrderCleanup sweeper takes care of
  // abandoned orders after 30 min so the user can retry with another method.
  const { pay, placing, error, setError } = usePayment({
    items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
    shippingAddressId: selectedAddressId,
    couponCode: appliedCoupon?.code,
    coinsToRedeem: actualCoinsUsed,
    prefill: {
      name: dbUser?.full_name || "",
      email: dbUser?.email || user?.email || "",
      contact: dbUser?.phone || user?.phone || "",
    },
    themeColor: "#1A6FD4",
    onSuccess: async () => {
      await clearCart();
      router.push(`/orders?placed=1`);
    },
    onDismiss: (method) => {
      // Don't cancel the order — let the user pick a different method and try
      // again. The pendingOrderCleanup cron will sweep it after 30 min if
      // they abandon entirely.
      setLastFailed({ method, reason: "Modal dismissed without payment" });
      toast("Pick another payment method to continue", { icon: "💡" });
    },
    onFailed: (method, message) => {
      setLastFailed({ method, reason: message });
      toast.error(message);
    },
  });

  const handlePickerSelect = (method: PaymentMethod) => {
    if (!hasAddress) {
      toast.error("Please add or select a delivery address first");
      return;
    }
    if (cartBlocked) {
      toast.error("Please resolve the cart warnings above");
      return;
    }
    // Razorpay script needed for everything except COD.
    if (method.kind !== "cod" && !razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }
    setLastFailed(null);
    pay(method);
  };

  const pickerDisabled = placing || cartBlocked || validating || !hasAddress;

  // Show skeleton while cart is loading on page refresh
  if (loading && items.length === 0) {
    return (
      <div className="bg-[#F7F7F8] min-h-screen lg:bg-white">
        {/* Mobile header skeleton */}
        <header className="flex lg:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse mr-3" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </header>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6 lg:py-10">
          {/* Desktop heading skeleton */}
          <div className="hidden lg:flex items-baseline gap-3 mb-8">
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* Mobile subheading skeleton */}
          <div className="lg:hidden mb-4 mt-2">
            <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Address skeleton */}
              <div className="rounded-xl border border-gray-200 p-5 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="rounded-xl border-2 border-gray-100 p-4 space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>

              {/* Order items skeleton */}
              <div className="rounded-xl border border-gray-200 p-5 bg-white">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-6 py-4 border-b border-gray-100 last:border-0">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — price summary skeleton */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-gray-200 p-5 bg-white">
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex justify-between">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-16 text-center">
        <PackageOpen className="w-16 h-16 mx-auto mb-4" style={{ color: t.textMuted }} />
        <h2 className="text-lg font-bold mb-2" style={{ color: t.textPrimary }}>
          Your cart is empty
        </h2>
        <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
          Add items to your cart before checking out.
        </p>
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: t.primaryCta, color: t.ctaText }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Inline Address Form Component ──
  const addressFormUI = (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-xl border-2 border-[#1A6FD4]/20 bg-blue-50/30 p-5 mt-3">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-[16px] font-bold flex items-center gap-2" style={{ color: t.textPrimary }}>
            <Plus className="w-4 h-4" style={{ color: t.bluePrimary }} />
            Add New Address
          </h4>
          <button
            onClick={() => setShowAddressForm(false)}
            className="p-1.5 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" style={{ color: t.textMuted }} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">Label</label>
            <input className={inputCls} placeholder="Home, Office..." value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">Pincode *</label>
            <input className={inputCls} placeholder="110001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">Address Line 1 *</label>
            <input className={inputCls} placeholder="House/Flat No, Street" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">Address Line 2</label>
            <input className={inputCls} placeholder="Landmark, Area" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">City *</label>
            <input className={inputCls} placeholder="New Delhi" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block text-gray-500">State *</label>
            <input className={inputCls} placeholder="Delhi" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowAddressForm(false)}
            className="px-5 py-2.5 rounded-xl border text-[13px] font-bold hover:bg-white transition-all active:scale-95"
            style={{ borderColor: t.border, color: t.textSecondary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAddress}
            disabled={savingAddress}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            style={{ background: t.bluePrimary }}
          >
            {savingAddress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Save className="w-3.5 h-3.5" />
            Save Address
          </button>
        </div>
      </div>
    </div>
  );

  // ── Delivery Address Section ──
  const deliveryAddressUI = (
    <div className="rounded-xl border p-5" style={{ background: t.bgCard, borderColor: t.border }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-semibold flex items-center gap-2" style={{ color: t.textPrimary }}>
          <MapPin className="w-5 h-5" style={{ color: t.bluePrimary }} /> Delivery Address
        </h3>
        {addresses.length > 0 && !showAddressForm && (
          <button
            onClick={() => setShowAddressPicker(!showAddressPicker)}
            className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: t.bluePrimary }}
          >
            {showAddressPicker ? "Hide" : "Change"} <ChevronDown className={`w-3 h-3 transition-transform ${showAddressPicker ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {loadingAddresses ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
        </div>
      ) : addresses.length === 0 && !showAddressForm ? (
        /* ── No saved addresses ── */
        <div className="text-center py-6 border-2 border-dashed rounded-xl border-gray-200 bg-gray-50/50">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-[15px] font-bold text-gray-700 mb-1">No saved addresses</p>
          <p className="text-[13px] text-gray-500 mb-4">Add a delivery address to proceed with payment</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all active:scale-95 shadow-sm"
            style={{ background: t.bluePrimary }}
          >
            <Plus className="w-4 h-4" />
            Add an Address
          </button>
        </div>
      ) : (
        <>
          {/* ── Show selected address with card style ── */}
          {selectedAddress && !showAddressPicker && !showAddressForm && (
            <div
              className="rounded-xl border-2 p-4 relative transition-all"
              style={{ borderColor: t.bluePrimary, background: "#F8FBFF" }}
            >
              <div className="flex items-start gap-3">
                {/* Radio-style selected indicator */}
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: t.bluePrimary }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.bluePrimary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold" style={{ color: t.textPrimary }}>
                      {selectedAddress.label || "Address"}
                    </span>
                    {selectedAddress.is_default && (
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#1A6FD4] border border-blue-100">
                        Default
                      </span>
                    )}
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: t.bluePrimary }} />
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                    {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                  </p>
                  <p className="text-[14px] font-medium" style={{ color: t.textPrimary }}>
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Address picker (expanded list of all addresses) ── */}
          {showAddressPicker && !showAddressForm && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddressId(addr.id); setShowAddressPicker(false); }}
                    className="w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-sm group"
                    style={{
                      borderColor: isSelected ? t.bluePrimary : t.border,
                      background: isSelected ? "#F8FBFF" : t.bgCard,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio indicator */}
                      <div
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                        style={{ borderColor: isSelected ? t.bluePrimary : "#D1D5DB" }}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.bluePrimary }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[15px] font-bold" style={{ color: t.textPrimary }}>
                            {addr.label || "Address"}
                          </span>
                          {addr.is_default && (
                            <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#1A6FD4] border border-blue-100">
                              Default
                            </span>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: t.bluePrimary }} />
                          )}
                        </div>
                        <p className="text-[13px]" style={{ color: t.textSecondary }}>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Inline address form ── */}
          {showAddressForm && addressFormUI}

          {/* ── Add another address button ── */}
          {!showAddressForm && (
            <button
              onClick={openAddForm}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-bold hover:opacity-80 transition-opacity"
              style={{ color: t.bluePrimary }}
            >
              <Plus className="w-4 h-4" />
              {addresses.length > 0 ? "Add another address" : "Add an address"}
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-[#F7F7F8] min-h-screen pb-32 lg:pb-0 lg:bg-white relative">
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti width={windowWidth} height={windowHeight} recycle={false} numberOfPieces={300} gravity={0.2} />
        </div>
      )}
      {/* ══════════ MOBILE HEADER (<lg) ══════════ */}
      <header className="flex lg:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <Link href="/cart" className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight">
          Checkout
        </h1>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6 lg:py-10">
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[32px] font-medium tracking-tight" style={{ color: t.textPrimary }}>
              Checkout
            </h1>
            <span className="text-[18px] font-bold text-gray-400">
              ({items.length} {items.length === 1 ? "Item" : "Items"})
            </span>
          </div>
          <p className="text-sm font-medium" style={{ color: t.textSecondary }}>
            Review your order and pay securely with Razorpay
          </p>
        </div>

        {/* Mobile heading */}
        <div className="lg:hidden mb-4 mt-2">
          <p className="text-[14px] font-medium" style={{ color: t.textSecondary }}>
            Review your order and pay securely
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Order items — left column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Delivery Address */}
          {deliveryAddressUI}

          {/* Order Items */}
          <div
            className="rounded-xl border p-5"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            <h3 className="text-[17px] font-semibold mb-4" style={{ color: t.textPrimary }}>
              Order Items ({items.length})
            </h3>
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.sale_price ?? item.base_price;
                const disc = item.base_price > price
                  ? Math.round(((item.base_price - price) / item.base_price) * 100)
                  : 0;
                return (
                  <div key={item.productId} className="flex items-center gap-6 py-3 border-b last:border-0" style={{ borderColor: t.border }}>
                    <div
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-gray-50"
                      style={{ background: t.bgBlueTint }}
                    >
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen className="h-7 w-7" style={{ color: t.bluePrimary }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-medium truncate" style={{ color: t.textPrimary }}>
                        {item.name}
                      </p>
                      <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
                        Qty: {item.qty} x {formatINR(price)}
                      </p>
                      {disc > 0 && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[12px] font-bold">
                          {disc}% off
                        </span>
                      )}
                    </div>
                    <p className="text-[20px] font-bold shrink-0" style={{ color: t.textPrimary }}>
                      {formatINR(price * item.qty)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Payment method picker ──
              Replaces the old single "Pay" button. Each row opens Razorpay
              pre-filtered to the chosen method/brand (UPI app, wallet, etc.),
              or short-circuits to COD without Razorpay. */}
          <PaymentMethodPicker
            onSelect={handlePickerSelect}
            disabled={pickerDisabled}
            total={total}
            lastFailed={lastFailed}
          />
        </div>

        {/* Order summary — right column (matches CartSummary style) */}
        <div className="lg:col-span-4 mt-4 lg:mt-0">
          {/* Promos Section */}
          <div className="mb-4 space-y-4">
            {/* Coupon Card */}
            <div className="rounded-xl border p-5 bg-white shadow-sm transition-all" style={{ borderColor: t.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="w-5 h-5 text-emerald-500" />
                <h4 className="text-[16px] font-bold" style={{ color: t.textPrimary }}>Offers & Coupons</h4>
              </div>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-[13px] font-bold text-emerald-700">Applied</span>
                    </div>
                    <p className="text-[14px] text-emerald-600 font-medium">You saved {formatINR(couponDiscount)} on this order!</p>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="p-2 text-red-400 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-lg" title="Remove coupon">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code" 
                        className="h-11 w-full rounded-xl border border-gray-200 px-4 text-[14px] font-bold uppercase tracking-wide placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all bg-gray-50/50"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode}
                      className="h-11 px-5 rounded-xl font-bold text-white text-[14px] transition-all disabled:opacity-50 active:scale-95 bg-emerald-500 hover:bg-emerald-600"
                    >
                      {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[13px] mt-2 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{couponError}</p>}
                </>
              )}
            </div>

            {/* Coins Card */}
            {coinBalance > 0 && (
              <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: t.border }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[16px] font-bold" style={{ color: t.textPrimary }}>Use Coins</h4>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[12px] font-bold border border-orange-100">
                    Balance: {coinBalance}
                  </span>
                </div>
                <p className="text-[13px] mb-4 text-gray-500">You can redeem up to {maxCoinsAllowed} coins ({formatINR(maxCoinsAllowed)}) on this order.</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-11 bg-gray-50 flex-1">
                    <button 
                      onClick={() => setCoinsToUse(Math.max(0, coinsToUse - 10))}
                      className="w-11 h-full flex items-center justify-center hover:bg-gray-100 font-bold text-gray-600 border-r border-gray-200 transition-colors"
                    >-</button>
                    <input 
                      type="number"
                      value={coinsToUse === 0 ? "" : coinsToUse}
                      placeholder="0"
                      onChange={(e) => setCoinsToUse(Math.min(maxCoinsAllowed, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="flex-1 h-full text-center text-[15px] font-black focus:outline-none bg-transparent"
                    />
                    <button 
                      onClick={() => setCoinsToUse(Math.min(maxCoinsAllowed, coinsToUse + 10))}
                      className="w-11 h-full flex items-center justify-center hover:bg-gray-100 font-bold text-gray-600 border-l border-gray-200 transition-colors"
                    >+</button>
                  </div>
                  <button 
                    onClick={() => setCoinsToUse(maxCoinsAllowed)}
                    className="h-11 px-4 rounded-xl text-[13px] font-bold text-orange-600 bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    Use Max
                  </button>
                </div>
                {actualCoinsUsed > 0 && (
                  <p className="text-[13px] mt-3 font-bold text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Saves you {formatINR(actualCoinsUsed)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-6 lg:sticky lg:top-28 bg-white shadow-sm"
            style={{ borderColor: t.border }}
          >
            <h3
              className="text-[15px] font-black mb-6 uppercase tracking-wider"
              style={{ color: t.textPrimary }}
            >
              Price Details
            </h3>

            <div className="space-y-4 text-[15px]">
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>Subtotal</span>
                <span className="font-bold" style={{ color: t.textPrimary }}>
                  {formatINR(subtotal)}
                </span>
              </div>
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Coupon Discount</span>
                  <span className="font-bold text-green-600">
                    -{formatINR(couponDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>GST (18%)</span>
                <span className="font-bold" style={{ color: t.textPrimary }}>
                  {formatINR(gst)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>Delivery Charges</span>
                <span className="font-bold" style={{ color: delivery === 0 ? t.inStock : t.textPrimary }}>
                  {delivery === 0 ? "FREE" : formatINR(delivery)}
                </span>
              </div>
              {actualCoinsUsed > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Coins Discount</span>
                  <span className="font-bold text-green-600">
                    -{formatINR(actualCoinsUsed)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-5 mt-2" style={{ borderColor: t.border }}>
                <div className="flex justify-between items-end">
                  <span
                    className="text-[17px] font-black"
                    style={{ color: t.textPrimary }}
                  >
                    Total Amount
                  </span>
                  <span
                    className="text-[22px] font-black leading-none tracking-tight"
                    style={{ color: t.textPrimary }}
                  >
                    {formatINR(total)}
                  </span>
                </div>
              </div>
            </div>

            {cartWarnings.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                    {cartBlocked ? "Cannot proceed — fix these issues:" : "Warnings:"}
                  </span>
                </div>
                {cartWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700 ml-6">• {w}</p>
                ))}
              </div>
            )}

            {/* No-address warning */}
            {!hasAddress && !loadingAddresses && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                    Add a delivery address to proceed with payment
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 p-2 rounded-lg text-xs font-medium bg-red-50 text-red-600">
                {error}
              </div>
            )}

            {/* Desktop helper — picker is the action surface (left column).
                Show a processing pill here while a payment is in flight. */}
            <div className="hidden lg:block mt-8">
              {placing ? (
                <div
                  className="flex w-full items-center justify-center gap-2 rounded-xl h-[52px] text-[16px] font-bold"
                  style={{ background: "#F3F4F6", color: t.textSecondary }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing payment…
                </div>
              ) : (
                <p className="text-center text-sm" style={{ color: t.textMuted }}>
                  {hasAddress
                    ? "Choose a payment method on the left to continue →"
                    : "Add a delivery address to choose a payment method"}
                </p>
              )}
            </div>

            {!razorpayLoaded && (
              <p className="mt-2 text-center text-sm" style={{ color: t.textMuted }}>
                Loading payment gateway...
              </p>
            )}

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm font-bold transition-opacity hover:opacity-80"
              style={{ color: t.bluePrimary }}
            >
              Back to Cart
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-around mt-5 pt-4 border-t" style={{ borderColor: t.border }}>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-[12px] font-medium text-gray-500">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-[12px] font-medium text-gray-500">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-[12px] font-medium text-gray-500">Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


      {/* ══════════ MOBILE STICKY SUMMARY BAR (<lg) ══════════
          The action surface is now the inline PaymentMethodPicker above the
          fold of the scroll area. This bar only shows the total + a hint so
          the user always sees what they're about to pay. */}
      <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-500 px-4 py-3 flex gap-4 items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[18px] font-black text-gray-900 leading-none">{formatINR(total)}</span>
          <span className="text-[12px] font-bold text-[#1A6FD4] mt-0.5">TOTAL</span>
        </div>

        <div className="text-right">
          {placing ? (
            <span className="inline-flex items-center gap-2 text-[14px] font-bold text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </span>
          ) : (
            <span className="text-[13px] font-semibold" style={{ color: t.textSecondary }}>
              {hasAddress ? "Pick a method below ↑" : "Add address to pay"}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
