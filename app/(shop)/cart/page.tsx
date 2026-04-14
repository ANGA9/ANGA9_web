"use client";

import { Minus, Plus, Trash2, PackageOpen, ShoppingBag } from "lucide-react";
import CartSummary from "@/components/customer/CartSummary";
import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const cartItems = [
  {
    id: "c1",
    name: "Premium Mesh Office Chair",
    seller: "Rajesh Furniture",
    price: 12499,
    qty: 5,
  },
  {
    id: "c2",
    name: "LED Panel Light 40W",
    seller: "Bright Solutions",
    price: 3299,
    qty: 10,
  },
  {
    id: "c3",
    name: "Wireless Keyboard + Mouse Combo",
    seller: "TechNest India",
    price: 2199,
    qty: 5,
  },
];

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function CustomerCartPage() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
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
  );
}
