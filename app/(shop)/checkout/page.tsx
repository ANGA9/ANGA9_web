"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Loader2, CreditCard, PackageOpen, Lock, MapPin, ChevronDown, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
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

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, dbUser } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [cartWarnings, setCartWarnings] = useState<string[]>([]);
  const [cartBlocked, setCartBlocked] = useState(false);
  const [validating, setValidating] = useState(true);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ addresses?: Address[]; data?: Address[] }>("/api/users/addresses", { silent: true });
        const list = res?.addresses || res?.data || [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
      } catch { /* ignore */ }
    })();
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.sale_price ?? item.base_price) * item.qty,
    0
  );
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

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

  const handlePayWithRazorpay = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      // Step 1: Create order in our backend
      const orderResponse = await api.post<{ id: string; order_number: string; total: number }>(
        "/api/orders",
        {
          items: items.map(item => ({
            productId: item.productId,
            qty: item.qty,
          })),
          ...(selectedAddressId ? { address_id: selectedAddressId } : {}),
        }
      );

      // Step 2: Create Razorpay order via payment-service
      const paymentResponse = await api.post<{
        razorpay_order_id: string;
        amount: number;
        currency: string;
        key_id: string;
      }>("/api/payments/create", {
        orderId: orderResponse.id,
        amount: orderResponse.total,
      });

      // Step 3: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: paymentResponse.key_id,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        name: "ANGA9",
        description: `Order ${orderResponse.order_number}`,
        order_id: paymentResponse.razorpay_order_id,
        handler: async (response: RazorpayResponse) => {
          // Step 4: Verify payment on backend
          try {
            await api.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful! Order confirmed 🎉", {
              duration: 4000,
            });
            await clearCart();
            router.push(`/orders?placed=1`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
            setError("Payment verification failed. Your payment may have been processed — please contact support.");
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: dbUser?.full_name || "",
          email: dbUser?.email || user?.email || "",
          contact: dbUser?.phone || user?.phone || "",
        },
        theme: {
          color: "#1A6FD4",
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast("Payment cancelled", {
              icon: "ℹ️",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: unknown) => {
        setPlacing(false);
        const failedResponse = response as { error?: { description?: string } };
        toast.error(failedResponse?.error?.description || "Payment failed. Please try again.");
        setError(failedResponse?.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err: unknown) {
      setPlacing(false);
      const message = err instanceof Error ? err.message : "Failed to initiate payment";
      setError(message);
      toast.error(message);
    }
  };

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

  return (
    <div className="bg-[#F7F7F8] min-h-screen pb-32 lg:pb-0 lg:bg-white">
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
          <div className="rounded-xl border p-5" style={{ background: t.bgCard, borderColor: t.border }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-semibold flex items-center gap-2" style={{ color: t.textPrimary }}>
                <MapPin className="w-5 h-5" style={{ color: t.bluePrimary }} /> Delivery Address
              </h3>
              {addresses.length > 1 && (
                <button
                  onClick={() => setShowAddressPicker(!showAddressPicker)}
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: t.bluePrimary }}
                >
                  Change <ChevronDown className="w-3 h-3" />
                </button>
              )}
            </div>
            {selectedAddress ? (
              <div>
                <p className="text-[15px] font-medium" style={{ color: t.textPrimary }}>
                  {selectedAddress.label || "Address"}{selectedAddress.is_default ? " (Default)" : ""}
                </p>
                <p className="text-[15px] mt-0.5" style={{ color: t.textSecondary }}>
                  {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                </p>
                <p className="text-[15px]" style={{ color: t.textSecondary }}>
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </p>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-[15px]" style={{ color: t.textMuted }}>No saved addresses</p>
                <Link href="/account" className="text-sm font-semibold mt-1 inline-block" style={{ color: t.bluePrimary }}>
                  + Add an address
                </Link>
              </div>
            )}
            {showAddressPicker && (
              <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: t.border }}>
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddressId(addr.id); setShowAddressPicker(false); }}
                    className="w-full text-left rounded-lg border p-3 text-[15px] transition-colors hover:bg-gray-50"
                    style={{ borderColor: addr.id === selectedAddressId ? t.bluePrimary : t.border }}
                  >
                    <span className="font-medium" style={{ color: t.textPrimary }}>{addr.label || "Address"}</span>
                    {addr.is_default && <span className="ml-2 text-xs font-semibold" style={{ color: t.bluePrimary }}>(Default)</span>}
                    <p className="text-sm mt-0.5" style={{ color: t.textSecondary }}>
                      {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

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

          {/* Payment method info */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "#F0F7FF", borderColor: "#B8D4F0" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1A6FD4" }}>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "#1A6FD4" }}>
                  Secure Payment via Razorpay
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#5B8FC9" }}>
                  UPI, Credit/Debit Cards, Net Banking, Wallets — all accepted. 100% safe & secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary — right column (matches CartSummary style) */}
        <div className="lg:col-span-4 mt-4 lg:mt-0">
          <div
            className="rounded-xl border p-6 lg:sticky lg:top-28 bg-white"
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

            {error && (
              <div className="mt-3 p-2 rounded-lg text-xs font-medium bg-red-50 text-red-600">
                {error}
              </div>
            )}

            {/* Desktop CTA — matches cart's purple button */}
            <div className="hidden lg:block">
              <button
                onClick={handlePayWithRazorpay}
                disabled={placing || !razorpayLoaded || cartBlocked || validating}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl h-[52px] text-[18px] font-black transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-indigo-100"
                style={{ background: t.primaryCta, color: t.ctaText }}
              >
                {placing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay {formatINR(total)}
                  </>
                )}
              </button>
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


      {/* ══════════ MOBILE STICKY PAYMENT BAR (<lg) ══════════ */}
      <div className="lg:hidden fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-500 px-4 py-3 flex gap-4 items-center">
        <div className="flex flex-col">
          <span className="text-[18px] font-black text-gray-900 leading-none">{formatINR(total)}</span>
          <span className="text-[12px] font-bold text-[#1A6FD4] mt-0.5">TOTAL</span>
        </div>
        
        <button
          onClick={handlePayWithRazorpay}
          disabled={placing || !razorpayLoaded || cartBlocked || validating}
          className="flex-1 h-[52px] bg-[#1A6FD4] text-white rounded-xl text-[18px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
        >
          {placing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay {formatINR(total)}
            </>
          )}
        </button>
      </div>

    </div>
  );
}
