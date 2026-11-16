"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, ShieldCheck, ChevronRight } from "lucide-react";

export default function PromotionalBanner() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 20, marginBottom: 14 }}>
      <div className="relative rounded-2xl overflow-hidden border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] bg-white">
        {/* Main Visual Stage — uses exact 1024:416 aspect ratio so 100% of the image is shown with zero crop */}
        <div className="relative w-full aspect-[1024/416] overflow-hidden">
          {/* 1. Exact uncropped, un-darkened user image */}
          <img
            src="/banners/grand_dhamaka_banner.jpg"
            alt="Grand Dhamaka Offer"
            className="w-full h-full object-cover"
            loading="eager"
          />

          {/* 2. Center Promotional Content Stack */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            {/* Mughal Heritage Ornamental Plaque */}
            <div className="relative mb-1.5 sm:mb-2 px-5 sm:px-7 py-1.5 sm:py-2 rounded-2xl bg-[#064E3B] border-2 border-[#F59E0B] shadow-[0_6px_20px_rgba(0,0,0,0.35)] flex flex-col items-center">
              {/* Crown Jewel Accent */}
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FDE68A] shadow-sm -mt-3 mb-0.5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#064E3B]" />
              </div>

              {/* Title: GRAND DHAMAKA OFFER */}
              <h3 className="font-serif font-black text-xs sm:text-sm md:text-[17px] tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFFBEB] via-[#FDE68A] to-[#F59E0B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Grand Dhamaka Offer
              </h3>

              {/* LIVE NOW Pill */}
              <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D97706] text-white text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Live Now</span>
              </div>
            </div>

            {/* Tagline: Bulk Discounts & Wholesale Rates */}
            <p className="font-semibold text-xs sm:text-sm md:text-[15px] text-[#1A1A2E] tracking-wide drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] mb-0.5 sm:mb-1">
              Tiered Wholesale Rates • Maximum Bulk Discounts
            </p>

            {/* Big Discount Percentage */}
            <div className="flex items-baseline justify-center">
              <span className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-none tracking-tight text-[#E69500] drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                50-80% OFF
              </span>
            </div>

            {/* Small T&C applied */}
            <span className="text-[10px] sm:text-[11px] text-[#374151] font-semibold tracking-wider uppercase mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              *T&amp;C Applied
            </span>
          </div>
        </div>

        {/* Bottom Trust Strip — Deep Brand Royal Navy Blue (variant of website blue #1A6FD4, NOT purple!) */}
        <div className="relative z-10 bg-[#0B2545] border-t border-[#1A6FD4]/30 py-2.5 px-4 sm:px-8">
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
