"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  MapPin,
  ChevronDown,
  Package,
  Store,
  Megaphone,
  Download,
  User,
} from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function CustomerTopNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: t.bgCard }}>

      {/* ── Row 1: full-width bg band ── */}
      <div className="w-full border-b" style={{ borderColor: t.border }}>
        {/* constrained content */}
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1280, padding: "0 24px", height: 56 }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-[26px] font-extrabold tracking-tight"
            style={{ color: t.textPrimary, minWidth: "fit-content" }}
          >
            ANGA
          </Link>

          <div className="flex-1" />

          {/* Login + Pincode */}
          <div className="flex items-center" style={{ gap: 24, minWidth: "fit-content" }}>
            <button
              className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textPrimary, fontSize: 15 }}
            >
              <User style={{ width: 18, height: 18 }} />
              Login
            </button>
            <button
              className="flex items-center gap-2 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: 15 }}
            >
              <MapPin style={{ width: 18, height: 18, color: t.bluePrimary }} />
              Select Pincode
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: full-width bg band ── */}
      <div className="w-full border-b" style={{ borderColor: t.border }}>
        {/* constrained content */}
        <div
          className="mx-auto flex items-center"
          style={{ maxWidth: 1280, padding: "0 24px", height: 72 }}
        >
          {/* Search bar — flex:1, max 700px */}
          <div
            className="relative"
            style={{ flex: 1, maxWidth: 700 }}
          >
            <input
              type="text"
              placeholder="Search products, sellers..."
              className="w-full outline-none transition-colors"
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${t.bluePrimary}`,
                borderRadius: 4,
                padding: "12px 48px 12px 16px",
                fontSize: 15,
                color: t.textPrimary,
                lineHeight: "1.4",
              }}
            />
            {/* Icon with left-border separator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center"
              style={{
                right: 0,
                height: "100%",
                paddingLeft: 10,
                paddingRight: 12,
                borderLeft: "1.5px solid #E8EEF4",
                color: t.bluePrimary,
              }}
            >
              <Search style={{ width: 20, height: 20 }} />
            </div>
          </div>

          {/* Right icons group */}
          <div
            className="flex items-center shrink-0"
            style={{ marginLeft: 40, gap: 36, minWidth: "fit-content" }}
          >
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-2 font-medium transition-colors hover:text-[#DC2626]"
              style={{ color: t.textSecondary, fontSize: 15 }}
            >
              <Heart style={{ width: 20, height: 20 }} />
              Wishlist
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 font-medium transition-colors hover:text-[#1A6FD4]"
              style={{ color: t.textSecondary, fontSize: 15 }}
            >
              <div className="relative">
                <ShoppingCart style={{ width: 20, height: 20 }} />
                <span
                  className="absolute -top-1.5 -right-2.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: t.yellowCta, color: t.ctaText }}
                >
                  3
                </span>
              </div>
              Cart
            </Link>

            {/* More */}
            <div
              className="relative"
              ref={moreRef}
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 font-medium cursor-pointer transition-colors hover:text-[#1A6FD4]"
                style={{ color: t.textSecondary, fontSize: 15 }}
              >
                More
                <ChevronDown style={{ width: 16, height: 16 }} />
              </button>

              {moreOpen && (
                <div
                  className="absolute right-0 top-full w-56 rounded-lg border py-1.5"
                  style={{
                    background: "#FFFFFF",
                    borderColor: t.border,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    zIndex: 50,
                  }}
                >
                  {[
                    { icon: Package, label: "My Orders", href: "/orders" },
                    { icon: Store, label: "Become a Seller" },
                    { icon: Megaphone, label: "Advertise on ANGA" },
                    { icon: Download, label: "Download the App" },
                  ].map((item) => {
                    const inner = (
                      <>
                        <item.icon style={{ width: 18, height: 18, color: t.textSecondary }} />
                        <span>{item.label}</span>
                      </>
                    );
                    if (item.href) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[#F3F4F6]"
                          style={{ color: t.textPrimary, fontSize: 15 }}
                        >
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-[#F3F4F6] text-left"
                        style={{ color: t.textPrimary, fontSize: 15 }}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
