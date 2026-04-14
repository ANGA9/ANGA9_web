"use client";

import Link from "next/link";
import { User, MapPin, ChevronDown, Search, Mic } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function MobileTopHeader() {
  // TODO: Replace with actual auth state
  const isLoggedIn = false;
  const userName = "Guest";

  return (
    <div className="w-full" style={{ background: t.bgCard }}>
      {/* ── Row 1: Logo + Login ── */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 16px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-[22px] font-extrabold tracking-tight"
          style={{ color: t.textPrimary }}
        >
          ANGA
        </Link>

        {/* Login / User Greeting */}
        {isLoggedIn ? (
          <div className="text-right">
            <p className="text-[11px]" style={{ color: t.textMuted }}>
              Hello,
            </p>
            <p
              className="text-[13px] font-bold leading-tight"
              style={{ color: t.bluePrimary }}
            >
              {userName}
            </p>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 font-medium"
            style={{ color: t.bluePrimary, fontSize: 14 }}
          >
            <User style={{ width: 16, height: 16 }} />
            Login
          </Link>
        )}
      </div>

      {/* ── Row 2: Delivery Location ── */}
      <button
        className="flex items-center w-full border-b"
        style={{
          padding: "8px 16px",
          borderColor: t.border,
          background: t.bgCard,
        }}
      >
        <MapPin
          style={{
            width: 18,
            height: 18,
            color: t.bluePrimary,
            flexShrink: 0,
          }}
        />
        <div className="flex flex-col items-start ml-2 flex-1 min-w-0">
          <span
            className="text-[13px] font-semibold leading-tight"
            style={{ color: t.textPrimary }}
          >
            Location not set
          </span>
          <span
            className="text-[11px] leading-tight"
            style={{ color: t.textMuted }}
          >
            Select delivery location
          </span>
        </div>
        <ChevronDown
          style={{
            width: 16,
            height: 16,
            color: t.textMuted,
            flexShrink: 0,
          }}
        />
      </button>

      {/* ── Row 3: Search Bar ── */}
      <div style={{ padding: "10px 12px" }}>
        <div
          className="flex items-center gap-2.5"
          style={{
            background: "#F3F4F6",
            borderRadius: 999,
            padding: "10px 16px",
          }}
        >
          <Search
            style={{
              width: 18,
              height: 18,
              color: t.textMuted,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search for products"
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: t.textPrimary }}
          />
          <Mic
            style={{
              width: 18,
              height: 18,
              color: t.textMuted,
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
