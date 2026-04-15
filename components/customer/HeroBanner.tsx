"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    id: 1,
    desktop: "/banners/banner1.png",
    mobile: "/banners/banner1mob.png",
    alt: "Elevate Your Style - Menswear from ₹799",
  },
  {
    id: 2,
    desktop: "/banners/banner2.png",
    mobile: "/banners/banner2mob.png",
    alt: "Sarees & Kurtas - Ethnic Festive Edit from ₹999",
  },
  {
    id: 3,
    desktop: "/banners/banner3.png",
    mobile: "/banners/banner3mob.png",
    alt: "Fun Fits for Little Ones - Kids Fashion from ₹299",
  },
  {
    id: 4,
    desktop: "/banners/banner4.png",
    mobile: "/banners/banner4mob.png",
    alt: "Train Harder Look Better - Activewear from ₹599",
  },
  {
    id: 5,
    desktop: "/banners/banner5.png",
    mobile: "/banners/banner5mob.png",
    alt: "Sleep in Pure Luxury - Bed Linen from ₹899",
  },
  {
    id: 6,
    desktop: "/banners/banner6.png",
    mobile: "/banners/banner6mob.png",
    alt: "Spa Comfort at Home - Bath Linen from ₹449",
  },
  {
    id: 7,
    desktop: "/banners/banner7.png",
    mobile: "/banners/banner7mob.png",
    alt: "Transform Your Living Space - Rugs & Curtains from ₹1299",
  },
  {
    id: 8,
    desktop: "/banners/banner8.png",
    mobile: "/banners/banner8mob.png",
    alt: "Style Every Corner - Living Decor from ₹349",
  },
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const length = BANNERS.length;

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % length);
  const prevBanner = () =>
    setCurrentIndex((prev) => (prev - 1 + length) % length);

  useEffect(() => {
    const interval = setInterval(nextBanner, 5000);
    return () => clearInterval(interval);
  }, []);

  function getPositionClasses(index: number) {
    const diff = (index - currentIndex + length) % length;

    if (diff === 0) {
      // CENTER ACTIVE
      return "z-10 opacity-100 scale-100 translate-x-0";
    } else if (diff === 1) {
      // NEXT
      return "z-0 opacity-0 sm:opacity-50 scale-95 translate-x-[105%] sm:translate-x-[85%] md:translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else if (diff === length - 1) {
      // PREV
      return "z-0 opacity-0 sm:opacity-50 scale-95 -translate-x-[105%] sm:-translate-x-[85%] md:-translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else {
      // HIDDEN / FAR AWAY
      if (diff > 1 && diff <= Math.floor(length / 2)) {
        return "-z-10 opacity-0 scale-90 translate-x-[200%] pointer-events-none";
      }
      return "-z-10 opacity-0 scale-90 -translate-x-[200%] pointer-events-none";
    }
  }

  return (
    <div className="w-full pb-6 pt-2">
      <div className="relative w-full h-[180px] sm:h-[260px] md:h-[280px] flex items-center justify-center overflow-hidden">
        {BANNERS.map((b, i) => (
          <div
            key={b.id}
            className={`absolute w-full sm:w-[75%] md:w-[70%] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${getPositionClasses(i)}`}
            onClick={() => {
              const diff = (i - currentIndex + length) % length;
              if (diff === 1) nextBanner();
              if (diff === length - 1) prevBanner();
            }}
          >
            {/* Desktop banner */}
            <Image
              src={b.desktop}
              alt={b.alt}
              fill
              sizes="(max-width: 640px) 100vw, 70vw"
              className="rounded-2xl shadow-md object-cover object-center hidden md:block"
              draggable={false}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              quality={75}
            />
            {/* Mobile banner */}
            <Image
              src={b.mobile}
              alt={b.alt}
              fill
              sizes="100vw"
              className="rounded-2xl shadow-md object-cover object-center block md:hidden"
              draggable={false}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              quality={75}
            />
          </div>
        ))}

        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevBanner();
          }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all hidden sm:flex border border-gray-100 items-center justify-center"
          aria-label="Previous banner"
        >
          <ChevronLeft
            className="w-5 h-5 sm:w-6 sm:h-6"
            strokeWidth={2.5}
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextBanner();
          }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all hidden sm:flex border border-gray-100 items-center justify-center"
          aria-label="Next banner"
        >
          <ChevronRight
            className="w-5 h-5 sm:w-6 sm:h-6"
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="mt-4 sm:mt-6 flex justify-center items-center gap-1.5 sm:gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 sm:w-8 bg-blue-600"
                : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
