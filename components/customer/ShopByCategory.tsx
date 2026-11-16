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
    image: "/categories/cropped/cat_menswear.png",
    href: "/search?category=MENSWEAR",
  },
  {
    name: "Womenswear",
    image: "/categories/cropped/cat_womenswear.png",
    href: "/search?category=WOMENSWEAR",
  },
  {
    name: "Kids & Infants",
    image: "/categories/cropped/cat_kids.png",
    href: "/search?category=KIDS%20%26%20INFANTS",
  },
  {
    name: "Active & Extras",
    image: "/categories/cropped/cat_bags.png",
    href: "/search?category=ACTIVE%20%26%20EXTRAS",
  },
  {
    name: "Bedding & Living",
    image: "/categories/cropped/cat_bedding.png",
    href: "/search?category=BEDDING%20%26%20LIVING%20DECOR",
  },
  {
    name: "Floors & Windows",
    image: "/categories/cropped/cat_floors.png",
    href: "/search?category=FLOORS%20%26%20WINDOWS",
  },
  {
    name: "Bath & Kitchen",
    image: "/categories/cropped/cat_bath.png",
    href: "/search?category=BATH%2C%20TABLE%20%26%20KITCHEN",
  },
];

export default function ShopByCategory() {
  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 24, marginBottom: 28 }}>
      {/* Header — matching Trending Now style, font, color and alignment */}
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
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

      {/* 7-column category grid with unconstrained rising subjects over Royal Blue Arches */}
      <div className="grid grid-cols-7 gap-3.5 lg:gap-5 items-end">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group flex flex-col items-center cursor-pointer text-center"
          >
            {/* Visual Stage: unclipped top so subjects naturally rise above the arch */}
            <div className="relative w-full h-[146px] lg:h-[158px] flex items-end justify-center overflow-visible">
              {/* 1. Arched dome backdrop — sits at the bottom behind the subject */}
              <div className="absolute bottom-0 w-[100px] h-[106px] lg:w-[110px] lg:h-[116px] rounded-t-full rounded-b-2xl bg-gradient-to-b from-[#3B82F6] via-[#1D60E8] to-[#0F47A6] shadow-[0_8px_20px_rgba(29,78,216,0.22)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_14px_30px_rgba(29,78,216,0.36)]" />

              {/* 2. Rising subject image — rises 30px–35px ABOVE the blue arch! */}
              <div className="relative z-10 w-full h-full flex items-end justify-center pb-0 transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="max-h-[142px] lg:max-h-[154px] w-auto max-w-full object-contain object-bottom drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Category Name */}
            <span className="text-[14px] lg:text-[14.5px] font-semibold text-[#1A1A2E] group-hover:text-[#1A6FD4] transition-colors mt-3 text-center leading-snug">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
