"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Loader2, CreditCard, PackageOpen, Lock, MapPin, ChevronDown } from "lucide-react";
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
          className="rounded-[10px] px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: t.primaryCta, color: t.ctaText }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-8 py-6">
      <h1 className="text-xl font-bold mb-1" style={{ color: t.textPrimary }}>
        Checkout
      </h1>
      <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
        Review your order and pay securely with Razorpay
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order items */}
        <div className="lg:col-span-3 space-y-3">
          {/* Delivery Address */}
          <div className="rounded-[14px] border p-5" style={{ background: t.bgCard, borderColor: t.border }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: t.textPrimary }}>
                <MapPin className="w-4 h-4" style={{ color: t.bluePrimary }} /> Delivery Address
              </h3>
              {addresses.length > 1 && (
                <button
                  onClick={() => setShowAddressPicker(!showAddressPicker)}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: t.bluePrimary }}
                >
                  Change <ChevronDown className="w-3 h-3" />
                </button>
              )}
            </div>
            {selectedAddress ? (
              <div>
                <p className="text-sm font-medium" style={{ color: t.textPrimary }}>
                  {selectedAddress.label || "Address"}{selectedAddress.is_default ? " (Default)" : ""}
                </p>
                <p className="text-sm mt-0.5" style={{ color: t.textSecondary }}>
                  {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                </p>
                <p className="text-sm" style={{ color: t.textSecondary }}>
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </p>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm" style={{ color: t.textMuted }}>No saved addresses</p>
                <Link href="/account" className="text-xs font-semibold mt-1 inline-block" style={{ color: t.bluePrimary }}>
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
                    className="w-full text-left rounded-lg border p-3 text-sm transition-colors hover:bg-gray-50"
                    style={{ borderColor: addr.id === selectedAddressId ? t.bluePrimary : t.border }}
                  >
                    <span className="font-medium" style={{ color: t.textPrimary }}>{addr.label || "Address"}</span>
                    {addr.is_default && <span className="ml-2 text-xs font-semibold" style={{ color: t.bluePrimary }}>(Default)</span>}
                    <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>
                      {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-[14px] border p-5"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            <h3 className="text-base font-semibold mb-4" style={{ color: t.textPrimary }}>
              Order Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item) => {
                const price = item.sale_price ?? item.base_price;
                return (
                  <div key={item.productId} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: t.border }}>
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg overflow-hidden"
                      style={{ background: t.bgBlueTint }}
                    >
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen className="h-5 w-5" style={{ color: t.bluePrimary }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: t.textPrimary }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: t.textMuted }}>
                        Qty: {item.qty} x {formatINR(price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: t.textPrimary }}>
                      {formatINR(price * item.qty)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment method info */}
          <div
            className="rounded-[14px] border p-5"
            style={{ background: "#F0F7FF", borderColor: "#B8D4F0" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1A6FD4" }}>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A6FD4" }}>
                  Secure Payment via Razorpay
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#5B8FC9" }}>
                  UPI, Credit/Debit Cards, Net Banking, Wallets — all accepted. 100% safe & secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div
            className="rounded-[14px] border p-5 sticky top-28"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            <h3 className="text-base font-semibold mb-4" style={{ color: t.textPrimary }}>
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>Subtotal</span>
                <span className="font-medium" style={{ color: t.textPrimary }}>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>GST (18%)</span>
                <span className="font-medium" style={{ color: t.textPrimary }}>{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: t.textSecondary }}>Delivery</span>
                <span className="font-medium" style={{ color: t.textPrimary }}>
                  {delivery === 0 ? "Free" : formatINR(delivery)}
                </span>
              </div>

              <div className="border-t pt-3" style={{ borderColor: t.border }}>
                <div className="flex justify-between">
                  <span className="text-base font-semibold" style={{ color: t.textPrimary }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: t.textPrimary }}>{formatINR(total)}</span>
                </div>
              </div>
            </div>

            {delivery === 0 && (
              <p className="mt-3 text-xs font-medium" style={{ color: t.inStock }}>
                Free delivery on orders above ₹10,000
              </p>
            )}

            {error && (
              <div className="mt-3 p-2 rounded-lg text-xs font-medium bg-red-50 text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePayWithRazorpay}
              disabled={placing || !razorpayLoaded}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] py-3.5 text-base font-bold transition-all hover:opacity-90 disabled:opacity-60 shadow-md"
              style={{ background: "#1A6FD4", color: "#FFFFFF" }}
            >
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatINR(total)} with Razorpay
                </>
              )}
            </button>

            {!razorpayLoaded && (
              <p className="mt-2 text-center text-xs md:text-sm" style={{ color: t.textMuted }}>
                Loading payment gateway...
              </p>
            )}

            <Link
              href="/cart"
              className="mt-3 block text-center text-sm md:text-base font-medium transition-opacity hover:opacity-80"
              style={{ color: t.bluePrimary }}
            >
              Back to Cart
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-around mt-5 pt-4 border-t" style={{ borderColor: t.border }}>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span className="text-[9px] text-gray-500">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-[9px] text-gray-500">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-[9px] text-gray-500">Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
