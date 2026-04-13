"use client";

import Link from "next/link";
import { Search, Bell, Heart, ShoppingCart } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function CustomerTopNav() {
  return (
    <header
      className="sticky top-0 z-40 h-16 border-b flex items-center px-4 sm:px-6"
      style={{ background: t.bgCard, borderColor: t.border }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-4">
        {/* Logo */}
        <Link
          href="/customer"
          className="shrink-0 text-[22px] font-extrabold tracking-tight"
          style={{ color: t.textPrimary }}
        >
          ANGA
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search products, sellers..."
            className="h-10 w-full rounded-full pl-4 pr-11 text-sm outline-none transition-colors"
            style={{
              background: t.bgBlueTint,
              border: `1px solid ${t.borderSearch}`,
              color: t.textPrimary,
            }}
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: t.bluePrimary }}
          >
            <Search className="h-[18px] w-[18px]" />
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Bell */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            style={{ color: t.textSecondary }}
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Wishlist */}
          <Link
            href="/customer/wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-[#DC2626]"
            style={{ color: t.textSecondary }}
          >
            <Heart className="h-[22px] w-[22px]" />
          </Link>

          {/* Cart */}
          <Link
            href="/customer/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            style={{ color: t.textSecondary }}
          >
            <ShoppingCart className="h-5 w-5" />
            <span
              className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: t.yellowCta, color: t.ctaText }}
            >
              3
            </span>
          </Link>

          {/* Avatar */}
          <Link
            href="/customer/account"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: t.bluePrimary }}
          >
            RK
          </Link>
        </div>
      </div>
    </header>
  );
}
