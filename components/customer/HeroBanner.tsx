"use client";

import { useState, useEffect, useCallback } from "react";
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

  const nextBanner = useCallback(
    () => setCurrentIndex((p) => (p + 1) % length),
    [length],
  );
  const prevBanner = useCallback(
    () => setCurrentIndex((p) => (p - 1 + length) % length),
    [length],
  );

  useEffect(() => {
    const id = setInterval(nextBanner, 4000);
    return () => clearInterval(id);
  }, [nextBanner]);

  /* ── desktop position classes (unchanged) ── */
  function getPositionClasses(index: number) {
    const diff = (index - currentIndex + length) % length;
    if (diff === 0) {
      return "z-10 opacity-100 scale-100 translate-x-0";
    } else if (diff === 1) {
      return "z-0 opacity-0 sm:opacity-50 scale-95 translate-x-[105%] sm:translate-x-[85%] md:translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else if (diff === length - 1) {
      return "z-0 opacity-0 sm:opacity-50 scale-95 -translate-x-[105%] sm:-translate-x-[85%] md:-translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else {
      if (diff > 1 && diff <= Math.floor(length / 2)) {
        return "-z-10 opacity-0 scale-90 translate-x-[200%] pointer-events-none";
      }
      return "-z-10 opacity-0 scale-90 -translate-x-[200%] pointer-events-none";
    }
  }

  return (
    <div className="w-full pb-6 pt-2">

      {/* ══════ MOBILE (<md): simple fade + small arrow buttons ══════ */}
      <div className="block md:hidden w-full px-5" style={{ position: "relative" }}>
        <div className="relative w-full" style={{ aspectRatio: "16/7" }}>
          {BANNERS.map((b, i) => (
            <Image
              key={b.id}
              src={b.mobile}
              alt={b.alt}
              fill
              sizes="100vw"
              className="rounded-xl object-cover object-center transition-opacity duration-500"
              style={{ opacity: i === currentIndex ? 1 : 0 }}
              draggable={false}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              quality={75}
            />
          ))}
        </div>

        {/* Arrow buttons sit outside the image via negative offset */}
        <button
          onClick={prevBanner}
          className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full bg-white active:bg-gray-100 shadow"
          style={{ width: 26, height: 26, left: 4 }}
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-700" strokeWidth={2.5} />
        </button>
        <button
          onClick={nextBanner}
          className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full bg-white active:bg-gray-100 shadow"
          style={{ width: 26, height: 26, right: 4 }}
          aria-label="Next banner"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" strokeWidth={2.5} />
        </button>
      </div>

      {/* ══════ DESKTOP (md+): 3D carousel ══════ */}
      <div className="hidden md:block">
        <div className="relative w-full h-[260px] md:h-[280px] flex items-center justify-center overflow-hidden">
          {BANNERS.map((b, i) => (
            <div
              key={b.id}
              className={`absolute w-[75%] md:w-[70%] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${getPositionClasses(i)}`}
              onClick={() => {
                const diff = (i - currentIndex + length) % length;
                if (diff === 1) nextBanner();
                if (diff === length - 1) prevBanner();
              }}
            >
              <Image
                src={b.desktop}
                alt={b.alt}
                fill
                sizes="70vw"
                className="rounded-2xl shadow-md object-cover object-center"
                draggable={false}
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                quality={75}
              />
            </div>
          ))}

          <button
            onClick={(e) => { e.stopPropagation(); prevBanner(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all flex border border-gray-100 items-center justify-center"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextBanner(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all flex border border-gray-100 items-center justify-center"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
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
