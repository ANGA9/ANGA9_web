"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cdnUrl } from "@/lib/utils";

const ALL_BANNERS = [
  {
    id: 1,
    desktop: cdnUrl("/banners/banner1.png"),
    mobile: cdnUrl("/banners/banner1mob.png"),
    alt: "Elevate Your Style - Menswear from ₹799",
  },
  {
    id: 2,
    desktop: cdnUrl("/banners/banner2.png"),
    mobile: cdnUrl("/banners/banner2mob.png"),
    alt: "Sarees & Kurtas - Ethnic Festive Edit from ₹999",
  },
  {
    id: 3,
    desktop: cdnUrl("/banners/banner3.png"),
    mobile: cdnUrl("/banners/banner3mob.png"),
    alt: "Fun Fits for Little Ones - Kids Fashion from ₹299",
  },
  {
    id: 4,
    desktop: cdnUrl("/banners/banner4.png"),
    mobile: cdnUrl("/banners/banner4mob.png"),
    alt: "Train Harder Look Better - Activewear from ₹599",
  },
  {
    id: 5,
    desktop: cdnUrl("/banners/banner5.png"),
    mobile: cdnUrl("/banners/banner5mob.png"),
    alt: "Sleep in Pure Luxury - Bed Linen from ₹899",
  },
  {
    id: 6,
    desktop: cdnUrl("/banners/banner6.png"),
    mobile: cdnUrl("/banners/banner6mob.png"),
    alt: "Spa Comfort at Home - Bath Linen from ₹449",
  },
  {
    id: 7,
    desktop: cdnUrl("/banners/banner7.png"),
    mobile: cdnUrl("/banners/banner7mob.png"),
    alt: "Transform Your Living Space - Rugs & Curtains from ₹1299",
  },
  {
    id: 8,
    desktop: cdnUrl("/banners/banner8.png"),
    mobile: cdnUrl("/banners/banner8mob.png"),
    alt: "Style Every Corner - Living Decor from ₹349",
  },
];

// Mobile: cap at 4 for cleaner UX. Desktop: show all.
const MOBILE_BANNERS = ALL_BANNERS.slice(0, 4);
const AUTO_PLAY_MS = 4500;

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const BANNERS = isMobile ? MOBILE_BANNERS : ALL_BANNERS;
  const length = BANNERS.length;

  /* ── Desktop UI ── */
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const scrollAmount = el.clientWidth * index;
      el.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setCurrentIndex(index);
    },
    []
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setCurrentIndex(index);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [length, scrollToIndex]);

  const handleNext = () => scrollToIndex((currentIndex + 1) % length);
  const handlePrev = () => scrollToIndex((currentIndex - 1 + length) % length);

  // Progress percentage for timer bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min((elapsed / AUTO_PLAY_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentIndex]);

  return (
    <div className="w-full pb-6 pt-2">
      {/* ══════ UNIFIED NATIVE SWIPE CAROUSEL ══════ */}
      <div className="relative w-full px-4 md:px-0 group max-w-[1280px] mx-auto">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide no-scrollbar w-full"
          style={{ scrollBehavior: "smooth", msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {BANNERS.map((b, i) => (
            <div
              key={b.id}
              className="w-full flex-shrink-0 snap-center px-1"
            >
              <div className="relative w-full h-[180px] md:h-[360px] lg:h-[400px] overflow-hidden rounded-xl">
                {/* Mobile Image */}
                <Image
                  src={b.mobile}
                  alt={b.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center md:hidden"
                  draggable={false}
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  quality={75}
                />
                {/* Desktop Image */}
                <Image
                  src={b.desktop}
                  alt={b.alt}
                  fill
                  sizes="100vw"
                  className="hidden md:block object-cover object-center"
                  draggable={false}
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  quality={85}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Arrow buttons - hidden on mobile, visible on desktop hover */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute top-1/2 left-6 -translate-y-1/2 z-20 items-center justify-center rounded-full bg-white/90 hover:bg-white active:bg-gray-100 shadow-md border border-gray-100 w-11 h-11 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute top-1/2 right-6 -translate-y-1/2 z-20 items-center justify-center rounded-full bg-white/90 hover:bg-white active:bg-gray-100 shadow-md border border-gray-100 w-11 h-11 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          aria-label="Next banner"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
        </button>
      </div>

      {/* ══════ PROGRESS BAR INDICATORS ══════ */}
      <div className="mt-3 sm:mt-5 flex justify-center items-center gap-1.5 sm:gap-2 px-4">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className="relative h-[3px] sm:h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{
              width: i === currentIndex ? (isMobile ? 32 : 48) : (isMobile ? 16 : 20),
              background: i === currentIndex ? "transparent" : "#D1D5DB",
            }}
            aria-label={`Go to banner ${i + 1}`}
          >
            {/* Track */}
            {i === currentIndex && (
              <>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#CBD5E1" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "#1A6FD4",
                    transition: "none",
                  }}
                />
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
