"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import CartSummary from "@/components/customer/CartSummary";
import Link from "next/link";

const cartItems = [
  {
    id: "c1",
    name: "Ergonomic Mesh Office Chair \u2014 Lumbar Support",
    seller: "Prestige Interiors",
    price: 8750,
    qty: 10,
    color: "#9CA3AF",
  },
  {
    id: "c2",
    name: "LED Panel Light 60x60cm \u2014 40W, Daylight",
    seller: "Sharma Electricals",
    price: 11250,
    qty: 20,
    color: "#9CA3AF",
  },
  {
    id: "c3",
    name: "Indoor Ceramic Planter Set \u2014 6 Piece",
    seller: "Green Decor Co",
    price: 3150,
    qty: 12,
    color: "#9CA3AF",
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1F2937]">Shopping Cart</h1>
          <p className="text-sm text-[#6B7280]">
            {cartItems.length} items in your cart
          </p>
        </div>
        <Link
          href="/customer"
          className="text-sm font-medium text-[#146EB4] hover:underline"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Cart items */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-3xl font-bold text-[#9CA3AF]">
                  {item.name.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#6B7280]">
                    {item.seller}
                  </p>
                  <h3 className="text-sm font-semibold text-[#1F2937] mt-0.5 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-medium text-[#1F2937] mt-1">
                    {formatINR(item.price)}{" "}
                    <span className="text-xs text-[#6B7280] font-normal">
                      / unit
                    </span>
                  </p>
                </div>

                {/* Qty + Subtotal */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-lg border border-[#E5E7EB]">
                    <button className="flex h-8 w-8 items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors rounded-l-lg">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-8 w-10 items-center justify-center border-x border-[#E5E7EB] text-sm font-medium text-[#1F2937]">
                      {item.qty}
                    </span>
                    <button className="flex h-8 w-8 items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors rounded-r-lg">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm font-semibold text-[#1F2937]">
                    {formatINR(item.price * item.qty)}
                  </p>

                  {/* Remove */}
                  <button className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937] transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white py-16">
              <ShoppingBag className="h-12 w-12 text-[#9CA3AF] mb-4" />
              <h3 className="text-base font-semibold text-[#1F2937]">
                Your cart is empty
              </h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                Browse products and add them to your cart.
              </p>
              <Link
                href="/customer"
                className="mt-4 rounded-lg bg-[#FF8C00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E67E00] transition-colors"
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
