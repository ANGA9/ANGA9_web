"use client";

import { useEffect } from "react";
import {
  Minus,
  Plus,
  Trash2,
  PackageOpen,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  ChevronRight,
  Ticket,
  Loader2,
} from "lucide-react";
import CartSummary from "@/components/customer/CartSummary";
import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCart } from "@/lib/CartContext";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerCartPage() {
  const { items, loading, updateQty, removeItem, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.sale_price ?? item.base_price) * item.qty,
    0
  );
  const totalOriginal = items.reduce(
    (sum, item) => sum + item.base_price * item.qty,
    0
  );
  const totalSavings = totalOriginal - subtotal;
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  const handleUpdateQty = async (productId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(1, currentQty + delta);
    await updateQty(productId, newQty);
  };

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* ══════════ MOBILE VIEW ══════════ */}
      <div
        className="block md:hidden min-h-screen bg-[#f1f3f6]"
        style={{ width: "calc(100% + 48px)", marginLeft: "-24px" }}
      >
        {/* Header */}
        <header className="flex items-center px-4 h-14 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
          <Link href="/" className="mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
              Shopping Cart
            </h1>
            <span className="text-xs md:text-sm text-gray-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 pt-20 pb-32">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: "#EAF2FF" }}
            >
              <ShoppingBag className="w-10 h-10" style={{ color: t.bluePrimary }} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm md:text-base text-gray-500 text-center mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="rounded-lg px-8 py-3 text-base font-bold transition-all active:scale-95"
              style={{ background: t.yellowCta, color: t.ctaText }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {totalSavings > 0 && (
              <div
                className="mx-0 px-4 py-2.5 flex items-center gap-2"
                style={{ background: "#E8F5E9" }}
              >
                <Tag className="w-4 h-4 text-green-700" />
                <span className="text-sm md:text-base font-medium text-green-800">
                  You&apos;re saving {formatINR(totalSavings)} on this order!
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              {items.map((item) => {
                const price = item.sale_price ?? item.base_price;
                const disc = item.base_price > price
                  ? Math.round(((item.base_price - price) / item.base_price) * 100)
                  : 0;
                return (
                  <div key={item.productId} className="bg-white px-4 py-4">
                    <div className="flex gap-3">
                      <div
                        className="w-[80px] h-[80px] shrink-0 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ background: "#EAF2FF" }}
                      >
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <PackageOpen className="w-8 h-8" style={{ color: t.bluePrimary }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-medium text-gray-900 leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-base md:text-lg font-bold text-gray-900">
                            {formatINR(price)}
                          </span>
                          {disc > 0 && (
                            <>
                              <span className="text-xs md:text-sm text-gray-400 line-through">
                                {formatINR(item.base_price)}
                              </span>
                              <span className="text-xs md:text-sm font-semibold text-green-600">
                                {disc}% off
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Truck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs md:text-sm text-gray-500">
                            {delivery === 0 ? (
                              <span className="text-green-600 font-semibold">FREE Delivery</span>
                            ) : (
                              "Standard Delivery"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-gray-200 transition-colors active:bg-gray-100"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <div className="w-10 h-8 flex items-center justify-center border-y border-gray-200 text-sm md:text-base font-semibold text-gray-900">
                          {item.qty}
                        </div>
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-gray-200 transition-colors active:bg-gray-100"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <span className="text-base font-bold text-gray-900">
                        {formatINR(price * item.qty)}
                      </span>

                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="flex items-center gap-1 text-xs md:text-sm text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden xs:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white mt-2 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5" style={{ color: t.bluePrimary }} />
                <span className="text-sm md:text-base font-medium text-gray-900">
                  Apply Coupon
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="bg-white mt-2 px-4 py-4">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                Price Details
              </h3>
              <div className="space-y-2.5 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({items.length} items)</span>
                  <span className="text-gray-900">{formatINR(totalOriginal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">
                      − {formatINR(totalSavings)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="text-gray-900">{formatINR(gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  {delivery === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="text-gray-900">{formatINR(delivery)}</span>
                  )}
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-base md:text-lg font-bold text-gray-900">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
              {totalSavings > 0 && (
                <div
                  className="mt-3 py-2 px-3 rounded-lg text-xs md:text-sm font-medium"
                  style={{ background: "#E8F5E9", color: "#2E7D32" }}
                >
                  You will save {formatINR(totalSavings)} on this order
                </div>
              )}
            </div>

            <div className="bg-white mt-2 px-4 py-4 flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-500 text-center leading-tight">
                  Safe &<br />Secure
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-500 text-center leading-tight">
                  Free<br />Delivery
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-500 text-center leading-tight">
                  Best<br />Prices
                </span>
              </div>
            </div>

            <div
              className="fixed bottom-[60px] left-0 right-0 z-40 bg-white border-t px-4 py-3 flex items-center justify-between"
              style={{ borderColor: t.border }}
            >
              <div>
                <span className="text-lg md:text-xl font-bold text-gray-900">
                  {formatINR(total)}
                </span>
                <button className="block text-xs md:text-sm font-medium" style={{ color: t.bluePrimary }}>
                  View price details
                </button>
              </div>
              <Link
                href="/checkout"
                className="rounded-lg px-8 py-3 text-base font-bold transition-all active:scale-95 shadow-md"
                style={{ background: t.yellowCta, color: t.ctaText }}
              >
                Place Order
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ══════════ DESKTOP VIEW ══════════ */}
      <div className="hidden md:block mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: t.textPrimary }}>
          Shopping Cart
        </h1>
        <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
          {items.length} items in your cart
        </p>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-3">
            {items.map((item) => {
              const price = item.sale_price ?? item.base_price;
              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border p-3.5"
                  style={{ background: t.bgCard, borderColor: t.border }}
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg overflow-hidden"
                    style={{ background: t.bgBlueTint }}
                  >
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <PackageOpen className="h-6 w-6" style={{ color: t.bluePrimary }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate" style={{ color: t.textPrimary }}>
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium mt-1" style={{ color: t.textPrimary }}>
                      {formatINR(price)}
                      <span className="text-xs font-normal ml-1" style={{ color: t.textMuted }}>
                        / {item.unit}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={() => handleUpdateQty(item.productId, item.qty, -1)}
                      className="flex h-8 w-8 items-center justify-center text-sm font-medium transition-colors rounded-md"
                      style={{ background: t.bgBlueTint, color: t.bluePrimary }}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className="flex h-8 w-10 items-center justify-center text-sm font-medium"
                      style={{ color: t.textPrimary }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.productId, item.qty, 1)}
                      className="flex h-8 w-8 items-center justify-center text-sm font-medium transition-colors rounded-md"
                      style={{ background: t.bgBlueTint, color: t.bluePrimary }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-bold shrink-0 w-24 text-right" style={{ color: t.textPrimary }}>
                    {formatINR(price * item.qty)}
                  </p>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="shrink-0 transition-opacity hover:opacity-80"
                    style={{ color: t.outOfStock }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {items.length === 0 && (
              <div
                className="flex flex-col items-center justify-center rounded-xl border py-16"
                style={{ background: t.bgCard, borderColor: t.border }}
              >
                <ShoppingBag className="h-12 w-12 mb-4" style={{ color: t.textMuted }} />
                <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm" style={{ color: t.textSecondary }}>
                  Browse products and add them to your cart.
                </p>
                <Link
                  href="/"
                  className="mt-4 rounded-[10px] px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: t.yellowCta, color: t.ctaText }}
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="col-span-12 xl:col-span-4">
              <CartSummary subtotal={subtotal} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
