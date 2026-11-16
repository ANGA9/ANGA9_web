"use client";

import Link from "next/link";

export default function SellerPromoBanner() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 28, marginBottom: 28 }}>
      <Link
        href="/seller/sell-on-anga9"
        className="group relative block rounded-2xl overflow-hidden border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
      >
        {/* Same 16:9 panoramic ratio as the customer promotional banner */}
        <div className="relative w-full aspect-[1376/768] overflow-hidden bg-[#0A192F]">
          <img
            src="/banners/seller_recruitment_banner.jpg"
            alt="Sell on ANGA9 - Scale Your Wholesale Business Pan-India"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.012]"
            loading="lazy"
          />
        </div>
      </Link>
    </section>
  );
}

