"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryTile {
  name: string;
  subtext: string;
  image: string;
  href: string;
}

const CATEGORIES: CategoryTile[] = [
  {
    name: "Menswear",
    subtext: "Shirts, Pants & more",
    image: "/categories/menswear_icon.png",
    href: "/search?category=MENSWEAR",
  },
  {
    name: "Womenswear",
    subtext: "Kurtas, Sarees & more",
    image: "/categories/womenswear_icon.png",
    href: "/search?category=WOMENSWEAR",
  },
  {
    name: "Kids & Infants",
    subtext: "Babycare, Sets & more",
    image: "/categories/kids_infants_icon.png",
    href: "/search?category=KIDS%20%26%20INFANTS",
  },
  {
    name: "Active & Extras",
    subtext: "Sportswear, Gear & more",
    image: "/categories/active_extras_icon.png",
    href: "/search?category=ACTIVE%20%26%20EXTRAS",
  },
  {
    name: "Bedding & Living",
    subtext: "Bedsheets, Covers & more",
    image: "/categories/bedding_decor_icon.png",
    href: "/search?category=BEDDING%20%26%20LIVING%20DECOR",
  },
  {
    name: "Floors & Windows",
    subtext: "Curtains, Rugs & more",
    image: "/categories/floors_windows_icon.png",
    href: "/search?category=FLOORS%20%26%20WINDOWS",
  },
  {
    name: "Bath & Kitchen",
    subtext: "Towels, Linen & more",
    image: "/categories/bath_kitchen_icon.png",
    href: "/search?category=BATH%2C%20TABLE%20%26%20KITCHEN",
  },
];

export default function ShopByCategory() {
  return (
    <section className="hidden md:block w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 my-6">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-[20px] text-[#1A1A2E] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Explore wholesale collections curated for verified retailers
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs font-semibold text-[#1A6FD4] hover:text-[#0D47A1] hover:underline flex items-center gap-0.5 transition-colors"
          >
            All Categories
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 7-column category grid */}
        <div className="grid grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center cursor-pointer text-center"
            >
              <div className="relative w-[96px] h-[96px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#F8FAFD] to-[#EAF2FF] border border-[#E2EBF6] p-2 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(26,111,212,0.15)] group-hover:border-[#1A6FD4]/50 group-hover:-translate-y-1">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-108"
                  loading="lazy"
                />
              </div>
              <span className="text-[13px] font-semibold text-gray-800 group-hover:text-[#1A6FD4] transition-colors mt-2.5 max-w-[110px] leading-tight line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10.5px] font-medium text-gray-400 group-hover:text-blue-500 transition-colors mt-0.5 max-w-[110px] leading-tight line-clamp-1">
                {cat.subtext}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
