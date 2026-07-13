"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

interface ProductRailProps {
  title: string;
  products: Product[];
  icon?: LucideIcon;
  iconColor?: string;
  // If true, the cards are a bit smaller for tighter spaces (e.g. cart)
  compact?: boolean;
}

export default function ProductRail({ title, products, icon: Icon, iconColor = "#1A6FD4", compact = false }: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`relative ${compact ? "mt-8 mb-6 md:mt-10 md:mb-8" : "my-8 md:my-12"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${compact ? "px-4 md:px-0" : "px-3 sm:px-8"}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: iconColor }} strokeWidth={2} />}
          <h2 className={`font-bold text-[#1A1A2E] ${compact ? "text-[16px] md:text-[18px]" : "text-[18px] md:text-[22px]"}`}>
            {title}
          </h2>
        </div>

        {/* Desktop arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:cursor-not-allowed shadow-sm"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:cursor-not-allowed shadow-sm"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable strip */}
      <div 
        className={`flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory ${compact ? "px-4 md:px-0 pb-4" : "px-3 sm:px-8 pb-6"}`}
        ref={scrollRef}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`shrink-0 snap-start ${compact ? "w-[150px] sm:w-[160px] md:w-[180px]" : "w-[160px] md:w-[220px]"}`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
