"use client";

import { useState } from "react";
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
} from "lucide-react";
import CartSummary from "@/components/customer/CartSummary";
import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const initialCartItems = [
  {
    id: "c1",
    name: "Premium Mesh Office Chair",
    seller: "Rajesh Furniture",
    price: 12499,
    originalPrice: 18000,
    qty: 5,
    deliveryDate: "Wed, 17 Apr",
    freeDelivery: true,
  },
  {
    id: "c2",
    name: "LED Panel Light 40W",
    seller: "Bright Solutions",
    price: 3299,
    originalPrice: 4800,
    qty: 10,
    deliveryDate: "Thu, 18 Apr",
    freeDelivery: true,
  },
  {
    id: "c3",
    name: "Wireless Keyboard + Mouse Combo",
    seller: "TechNest India",
    price: 2199,
    originalPrice: 3500,
    qty: 5,
    deliveryDate: "Fri, 19 Apr",
    freeDelivery: false,
  },
];

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

function getDiscount(original: number, current: number) {
  return Math.round(((original - current) / original) * 100);
}

export default function CustomerCartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const totalOriginal = cartItems.reduce(
    (sum, item) => sum + item.originalPrice * item.qty,
    0
  );
  const totalSavings = totalOriginal - subtotal;
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

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
            <h1 className="text-[17px] font-bold text-gray-900 leading-tight">
              Shopping Cart
            </h1>
            <span className="text-[11px] text-gray-500">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
          </div>
        </header>

        {cartItems.length === 0 ? (
          /* ── Empty Cart State ── */
          <div className="flex flex-col items-center justify-center px-8 pt-20 pb-32">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: "#EAF2FF" }}
            >
              <ShoppingBag className="w-10 h-10" style={{ color: t.bluePrimary }} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-[14px] text-gray-500 text-center mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="rounded-lg px-8 py-3 text-[15px] font-bold transition-all active:scale-95"
              style={{ background: t.yellowCta, color: t.ctaText }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* ── Savings Banner ── */}
            <div
              className="mx-0 px-4 py-2.5 flex items-center gap-2"
              style={{ background: "#E8F5E9" }}
            >
              <Tag className="w-4 h-4 text-green-700" />
              <span className="text-[13px] font-medium text-green-800">
                You&apos;re saving {formatINR(totalSavings)} on this order!
              </span>
            </div>

            {/* ── Cart Item Cards ── */}
            <div className="flex flex-col gap-2 mt-2">
              {cartItems.map((item) => {
                const disc = getDiscount(item.originalPrice, item.price);
                return (
                  <div key={item.id} className="bg-white px-4 py-4">
                    {/* Top row: Image + Details */}
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div
                        className="w-[80px] h-[80px] shrink-0 rounded-xl flex items-center justify-center"
                        style={{ background: "#EAF2FF" }}
                      >
                        <PackageOpen
                          className="w-8 h-8"
                          style={{ color: t.bluePrimary }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Seller: {item.seller}
                        </p>

                        {/* Pricing row */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[16px] font-bold text-gray-900">
                            {formatINR(item.price)}
                          </span>
                          <span className="text-[12px] text-gray-400 line-through">
                            {formatINR(item.originalPrice)}
                          </span>
                          <span className="text-[12px] font-semibold text-green-600">
                            {disc}% off
                          </span>
                        </div>

                        {/* Delivery info */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Truck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[11px] text-gray-500">
                            Delivery by{" "}
                            <span className="font-semibold text-gray-700">
                              {item.deliveryDate}
                            </span>
                            {item.freeDelivery && (
                              <span className="text-green-600 font-semibold">
                                {" "}
                                · FREE
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom controls row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-gray-200 transition-colors active:bg-gray-100"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <div className="w-10 h-8 flex items-center justify-center border-y border-gray-200 text-[14px] font-semibold text-gray-900">
                          {item.qty}
                        </div>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-gray-200 transition-colors active:bg-gray-100"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="text-[15px] font-bold text-gray-900">
                        {formatINR(item.price * item.qty)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden xs:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Coupon Row ── */}
            <div className="bg-white mt-2 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5" style={{ color: t.bluePrimary }} />
                <span className="text-[14px] font-medium text-gray-900">
                  Apply Coupon
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* ── Order Summary ── */}
            <div className="bg-white mt-2 px-4 py-4">
              <h3 className="text-[16px] font-bold text-gray-900 mb-4">
                Price Details
              </h3>

              <div className="space-y-2.5 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Price ({cartItems.length} items)
                  </span>
                  <span className="text-gray-900">
                    {formatINR(totalOriginal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600 font-medium">
                    − {formatINR(totalSavings)}
                  </span>
                </div>
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
                    <span className="text-[15px] font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-[17px] font-bold text-gray-900">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-3 py-2 px-3 rounded-lg text-[12px] font-medium"
                style={{ background: "#E8F5E9", color: "#2E7D32" }}
              >
                You will save {formatINR(totalSavings)} on this order
              </div>
            </div>

            {/* ── Trust Badges ── */}
            <div className="bg-white mt-2 px-4 py-4 flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 text-center leading-tight">
                  Safe &<br />
                  Secure
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 text-center leading-tight">
                  Free
                  <br />
                  Delivery
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center gap-1">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 text-center leading-tight">
                  Best
                  <br />
                  Prices
                </span>
              </div>
            </div>

            {/* ── Sticky Bottom CTA ── */}
            <div
              className="fixed bottom-[60px] left-0 right-0 z-40 bg-white border-t px-4 py-3 flex items-center justify-between"
              style={{ borderColor: t.border }}
            >
              <div>
                <span className="text-[18px] font-bold text-gray-900">
                  {formatINR(total)}
                </span>
                <button className="block text-[12px] font-medium" style={{ color: t.bluePrimary }}>
                  View price details
                </button>
              </div>
              <button
                className="rounded-lg px-8 py-3 text-[15px] font-bold transition-all active:scale-95 shadow-md"
                style={{ background: t.yellowCta, color: t.ctaText }}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════════ DESKTOP VIEW ══════════ */}
      <div className="hidden md:block mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
        <h1
          className="text-xl font-bold mb-1"
          style={{ color: t.textPrimary }}
        >
          Shopping Cart
        </h1>
        <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
          {cartItems.length} items in your cart
        </p>

        <div className="grid grid-cols-12 gap-6">
          {/* Cart items */}
          <div className="col-span-12 xl:col-span-8 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border p-3.5"
                style={{ background: t.bgCard, borderColor: t.border }}
              >
                {/* Thumbnail */}
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: t.bgBlueTint }}
                >
                  <PackageOpen
                    className="h-6 w-6"
                    style={{ color: t.bluePrimary }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-semibold truncate"
                    style={{ color: t.textPrimary }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>
                    {item.seller}
                  </p>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: t.textPrimary }}
                  >
                    {formatINR(item.price)}
                    <span className="text-xs font-normal ml-1" style={{ color: t.textMuted }}>
                      / unit
                    </span>
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQty(item.id, -1)}
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
                    onClick={() => updateQty(item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center text-sm font-medium transition-colors rounded-md"
                    style={{ background: t.bgBlueTint, color: t.bluePrimary }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <p
                  className="text-sm font-bold shrink-0 w-24 text-right"
                  style={{ color: t.textPrimary }}
                >
                  {formatINR(item.price * item.qty)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 transition-opacity hover:opacity-80"
                  style={{ color: t.outOfStock }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div
                className="flex flex-col items-center justify-center rounded-xl border py-16"
                style={{ background: t.bgCard, borderColor: t.border }}
              >
                <ShoppingBag
                  className="h-12 w-12 mb-4"
                  style={{ color: t.textMuted }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: t.textPrimary }}
                >
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

          {/* Order summary */}
          <div className="col-span-12 xl:col-span-4">
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      </div>
    </div>
  );
}
