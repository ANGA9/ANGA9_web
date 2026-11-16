"use client";

import Link from "next/link";

export default function PromotionalBanner() {
  return (
    <section className="hidden md:block px-3 sm:px-6 max-w-[1240px] mx-auto" style={{ marginTop: 20, marginBottom: 24 }}>
      <div className="grid grid-cols-2 gap-4 lg:gap-5 items-stretch">
        {/* Banner 1: Grand Dhamaka Offer & Bulk Discounts (Consumer / Buyer Offer) */}
        <Link
          href="/search"
          className="group relative block rounded-2xl overflow-hidden border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
        >
          <div className="relative w-full aspect-[1376/768] overflow-hidden bg-[#0A192F]">
            <img
              src="/banners/grand_dhamaka_offer_banner.jpg"
              alt="Grand Dhamaka Offer - Mega Bulk Discounts 50-80% OFF"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Banner 2: Sell on ANGA9 - Scale Your Wholesale Business (Seller Recruitment) */}
        <Link
          href="/seller/sell-on-anga9"
          className="group relative block rounded-2xl overflow-hidden border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
        >
          <div className="relative w-full aspect-[1376/768] overflow-hidden bg-[#0A192F]">
            <img
              src="/banners/seller_recruitment_banner.jpg"
              alt="Sell on ANGA9 - Scale Your Wholesale Business Pan-India"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              loading="lazy"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
