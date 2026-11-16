"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, ShieldCheck, ChevronRight } from "lucide-react";

export default function PromotionalBanner() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 20, marginBottom: 12 }}>
      <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.08)] bg-[#1A1A2E]">
        {/* Main Visual Stage */}
        <div className="relative w-full h-[270px] md:h-[290px] lg:h-[310px] overflow-hidden">
          {/* 1. Background Image — Modern Traditional Indian Daylight Festive Couple */}
          <img
            src="/banners/dhamaka_banner_bg.jpg"
            alt="Grand Dhamaka Offer"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />

          {/* 2. Soft Center Vignette / Contrast Overlay for perfect typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35" />

          {/* 3. Left Tag: Him > */}
          <Link
            href="/search?category=MENSWEAR"
            className="absolute bottom-4 left-6 lg:left-10 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-gradient-to-b from-[#FDE047] to-[#EAB308] text-[#1A1A2E] font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <span>Him</span>
            <span className="w-4 h-4 rounded-full bg-[#78350F] flex items-center justify-center text-white">
              <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </Link>

          {/* 4. Right Tag: Her > */}
          <Link
            href="/search?category=WOMENSWEAR"
            className="absolute bottom-4 right-6 lg:right-10 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-gradient-to-b from-[#FDE047] to-[#EAB308] text-[#1A1A2E] font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <span>Her</span>
            <span className="w-4 h-4 rounded-full bg-[#78350F] flex items-center justify-center text-white">
              <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </Link>

          {/* 5. Center Promotional Content Stack */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            {/* Mughal / Heritage Ornamental Arch Badge */}
            <div className="relative mb-2 px-6 py-2 rounded-2xl bg-[#064E3B]/95 border-2 border-[#F59E0B]/80 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm flex flex-col items-center">
              {/* Decorative top crown jewel accent */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FDE68A] shadow-sm -mt-3.5 mb-1 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#064E3B]" />
              </div>

              {/* Title: GRAND DHAMAKA OFFER */}
              <h3 className="font-serif font-black text-sm sm:text-base md:text-[18px] tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFFBEB] via-[#FDE68A] to-[#F59E0B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Grand Dhamaka Offer
              </h3>

              {/* LIVE NOW Pill */}
              <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D97706] text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Live Now</span>
              </div>
            </div>

            {/* Tagline: Bulk Discounts & Wholesale Rates */}
            <p className="font-medium text-xs sm:text-sm md:text-[15px] text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] mb-1">
              Tiered Wholesale Rates • Maximum Bulk Discounts
            </p>

            {/* Big Discount Percentage */}
            <div className="flex items-baseline justify-center">
              <span className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-[62px] leading-none tracking-tight text-[#FBBF24] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                50-80% OFF
              </span>
            </div>

            {/* Small T&C applied */}
            <span className="text-[10.5px] sm:text-[11px] text-white/80 font-medium tracking-wider uppercase mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              *T&amp;C Applied
            </span>
          </div>
        </div>

        {/* Bottom Trust Strip — Deep Royal Plum / Burgundy Bar */}
        <div className="relative z-10 bg-[#4A0B2B] border-t border-[#701A75]/40 py-2.5 px-4 sm:px-8">
          <div className="flex items-center justify-between max-w-[1100px] mx-auto text-white text-[11px] sm:text-[12px] font-bold tracking-wider uppercase">
            {/* 1. 100% Original Products */}
            <div className="flex items-center justify-center gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4 text-[#FDE047] shrink-0" strokeWidth={2.5} />
              <span>100% Original Products</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-4 bg-white/20 mx-2 shrink-0" />

            {/* 2. Easy Returns & Refunds */}
            <div className="flex items-center justify-center gap-2 flex-1">
              <RotateCcw className="w-4 h-4 text-[#FDE047] shrink-0" strokeWidth={2.5} />
              <span>Easy Returns &amp; Refunds</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-4 bg-white/20 mx-2 shrink-0" />

            {/* 3. 100% Secure Payments */}
            <div className="flex items-center justify-center gap-2 flex-1">
              <ShieldCheck className="w-4 h-4 text-[#FDE047] shrink-0" strokeWidth={2.5} />
              <span>100% Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

