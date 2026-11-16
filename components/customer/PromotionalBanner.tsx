"use client";

import Link from "next/link";

export default function PromotionalBanner() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 20, marginBottom: 16 }}>
      <Link
        href="/search"
        className="group relative block rounded-2xl overflow-hidden border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
      >
        <div className="relative w-full aspect-[1376/768] overflow-hidden bg-[#0A192F]">
          <img
            src="/banners/grand_dhamaka_offer_banner.jpg"
            alt="Grand Dhamaka Offer - Mega Bulk Discounts 50-80% OFF"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.012]"
            loading="eager"
          />
        </div>
      </Link>
    </section>
  );
}
