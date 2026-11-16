"use client";

import Link from "next/link";

interface CategoryTile {
  name: string;
  image: string;
  href: string;
}

const CATEGORIES: CategoryTile[] = [
  {
    name: "Menswear",
    image: "/categories/menswear_icon.png",
    href: "/search?category=MENSWEAR",
  },
  {
    name: "Womenswear",
    image: "/categories/womenswear_icon.png",
    href: "/search?category=WOMENSWEAR",
  },
  {
    name: "Kids & Infants",
    image: "/categories/kids_infants_icon.png",
    href: "/search?category=KIDS%20%26%20INFANTS",
  },
  {
    name: "Active & Extras",
    image: "/categories/active_extras_icon.png",
    href: "/search?category=ACTIVE%20%26%20EXTRAS",
  },
  {
    name: "Bedding & Living",
    image: "/categories/bedding_decor_icon.png",
    href: "/search?category=BEDDING%20%26%20LIVING%20DECOR",
  },
  {
    name: "Floors & Windows",
    image: "/categories/floors_windows_icon.png",
    href: "/search?category=FLOORS%20%26%20WINDOWS",
  },
  {
    name: "Bath & Kitchen",
    image: "/categories/bath_kitchen_icon.png",
    href: "/search?category=BATH%2C%20TABLE%20%26%20KITCHEN",
  },
];

export default function ShopByCategory() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 24, marginBottom: 24 }}>
      {/* Header — matching Trending Now style, font, color and alignment */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2">
          <h2 className="font-display font-semibold text-[18px] sm:text-[22px] md:text-[24px] text-[#1A1A2E] tracking-tight leading-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/search"
          className="font-medium sm:font-semibold text-[13px] sm:text-[15px] text-[#1A6FD4] transition-opacity hover:opacity-80"
        >
          View All
        </Link>
      </div>

      {/* 7-column category grid — properly occupying space with visible soft background */}
      <div className="grid grid-cols-7 gap-3.5 lg:gap-4.5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group flex flex-col items-center justify-center p-3.5 lg:p-4 rounded-2xl bg-[#F6F9FD] border border-[#E3EDF7] hover:bg-white hover:border-[#1A6FD4] hover:shadow-[0_10px_24px_rgba(26,111,212,0.14)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
          >
            <div className="w-[105px] h-[105px] lg:w-[115px] lg:h-[115px] flex items-center justify-center">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-108"
                loading="lazy"
              />
            </div>
            <span className="text-[14px] lg:text-[14.5px] font-semibold text-[#1A1A2E] group-hover:text-[#1A6FD4] transition-colors mt-2.5 text-center leading-snug">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
