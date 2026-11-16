"use client";

import { useState } from "react";
import Link from "next/link";

interface CategoryTile {
  name: string;
  image: string;
  href: string;
}

const CATEGORIES: CategoryTile[] = [
  // 1. Menswear
  {
    name: "Menswear",
    image: "/categories/cropped/cat_menswear.png",
    href: "/search?category=MENSWEAR",
  },
  {
    name: "T-Shirts & Tops",
    image: "/categories/cropped/cat_tees.png",
    href: "/search?category=MENSWEAR",
  },
  // 2. Womenswear
  {
    name: "Womenswear",
    image: "/categories/cropped/cat_womenswear.png",
    href: "/search?category=WOMENSWEAR",
  },
  // 3. Kids & Teens
  {
    name: "Kids & Teens",
    image: "/categories/cropped/cat_kids.png",
    href: "/search?category=KIDS%20%26%20INFANTS",
  },
  // 4. Home Decor (position 5)
  {
    name: "Home Decor",
    image: "/categories/cropped/cat_bath.png",
    href: "/search?category=BEDDING%20%26%20LIVING%20DECOR",
  },
  // 5. Active & Extras
  {
    name: "Bags & Luggage",
    image: "/categories/cropped/cat_bags.png",
    href: "/search?category=ACTIVE%20%26%20EXTRAS",
  },
  {
    name: "Watches & Extras",
    image: "/categories/cropped/cat_watch.png",
    href: "/search?category=ACTIVE%20%26%20EXTRAS",
  },
  // 6. Home, Bedding & Living
  {
    name: "Bedding & Living",
    image: "/categories/cropped/cat_bedding.png",
    href: "/search?category=BEDDING%20%26%20LIVING%20DECOR",
  },
  {
    name: "Floors & Rugs",
    image: "/categories/cropped/cat_floors.png",
    href: "/search?category=FLOORS%20%26%20WINDOWS",
  },
  // 7. Infants & Baby (position 10)
  {
    name: "Infants & Baby",
    image: "/categories/cropped/cat_infants.png",
    href: "/search?category=KIDS%20%26%20INFANTS",
  },
];

function CategoryCard({ cat, index }: { cat: CategoryTile; index: number }) {
  return (
    <Link
      key={`${cat.name}-${index}`}
      href={cat.href}
      className="group/card flex flex-col items-center cursor-pointer text-center shrink-0 w-[138px] lg:w-[150px]"
    >
      {/* Visual Stage: unclipped top so subjects naturally rise ~45px above the arch */}
      <div className="relative w-full h-[190px] lg:h-[204px] flex items-end justify-center overflow-visible">
        {/* 1. Arched dome backdrop — solid soft ice blue with curved bottom two corners */}
        <div
          className="absolute bottom-0 w-[132px] h-[136px] lg:w-[144px] lg:h-[148px] rounded-t-full rounded-b-[36px] lg:rounded-b-[40px] bg-[#EAF2FF] border border-[#D0E2FA] shadow-[0_4px_16px_rgba(26,111,212,0.08)] transition-all duration-300 group-hover/card:scale-105 group-hover/card:bg-[#DFEDFD] group-hover/card:border-[#BBD8F8] group-hover/card:shadow-[0_8px_24px_rgba(26,111,212,0.14)]"
        />

        {/* 2. Rising subject image — generously sized up and rising ~45px ABOVE the arch */}
        <div className="relative z-10 w-full h-full flex items-end justify-center pb-0 transition-transform duration-300 group-hover/card:-translate-y-2 group-hover/card:scale-105">
          <img
            src={cat.image}
            alt={cat.name}
            className="max-h-[184px] lg:max-h-[198px] w-auto max-w-full object-contain object-bottom drop-shadow-[0_6px_12px_rgba(15,23,42,0.16)]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Category Name — matching product card title style (e.g. Slim Fit Chinos) */}
      <span className="font-medium text-[15px] lg:text-[16px] text-[#1A1A2E] mt-3.5 text-center leading-snug whitespace-nowrap">
        {cat.name}
      </span>
    </Link>
  );
}

export default function ShopByCategory() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="hidden md:block px-3 sm:px-8 max-w-[1400px] mx-auto" style={{ marginTop: 24, marginBottom: 28 }}>
      {/* Header — matching Trending Now style, font, color and alignment */}
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <h2 className="font-display font-semibold text-[18px] sm:text-[22px] md:text-[24px] text-[#1A1A2E] tracking-tight leading-tight">
          Shop by Category
        </h2>
        <Link
          href="/search"
          className="font-medium sm:font-semibold text-[13px] sm:text-[15px] text-[#1A6FD4] transition-opacity hover:opacity-80"
        >
          View All
        </Link>
      </div>

      {/* Infinite Rolling Ribbon Carousel — guaranteed pause on hover */}
      <div
        className="relative overflow-hidden rolling-container py-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft Left & Right Edge Fades for seamless infinite entry & exit */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 lg:w-16 z-20 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 lg:w-16 z-20 bg-gradient-to-l from-white via-white/80 to-transparent" />

        {/* Two identical tracks moving in perfect sync for zero-seam infinite rolling */}
        <div className="flex w-max">
          {/* Primary Track */}
          <div
            className="flex items-end gap-6 lg:gap-7 shrink-0 pr-6 lg:pr-7 rolling-track"
            style={{ animationPlayState: isHovered ? "paused" : "running" }}
          >
            {CATEGORIES.map((cat, idx) => (
              <CategoryCard key={`track1-${cat.name}-${idx}`} cat={cat} index={idx} />
            ))}
          </div>

          {/* Secondary Duplicate Track (creates seamless infinite wrap) */}
          <div
            aria-hidden="true"
            className="flex items-end gap-6 lg:gap-7 shrink-0 pr-6 lg:pr-7 rolling-track"
            style={{ animationPlayState: isHovered ? "paused" : "running" }}
          >
            {CATEGORIES.map((cat, idx) => (
              <CategoryCard key={`track2-${cat.name}-${idx}`} cat={cat} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* Hardware-accelerated infinite rolling keyframe styles with hover pause guarantee */}
      <style jsx>{`
        @keyframes categoryRoll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .rolling-track {
          animation: categoryRoll 40s linear infinite;
          will-change: transform;
        }
        .rolling-container:hover .rolling-track,
        .rolling-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}
