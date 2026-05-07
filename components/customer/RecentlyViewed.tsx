"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import {
  useRecentlyViewed,
  type RecentlyViewedItem,
} from "@/hooks/useRecentlyViewed";

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface Props {
  /** Product ID to exclude (e.g. the one currently being viewed) */
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: Props) {
  const { items } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visible = excludeId ? items.filter((i) => i.id !== excludeId) : items;

  // Check scroll capability
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
  }, [visible.length]);

  if (visible.length === 0) return null;

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
    <section className="rv-section">
      {/* Header */}
      <div className="rv-header">
        <div className="rv-header-left">
          <Clock className="rv-header-icon" strokeWidth={2} />
          <h2 className="rv-title">Recently Viewed</h2>
        </div>

        {/* Desktop arrows */}
        <div className="rv-nav-arrows">
          <button
            className="rv-nav-btn"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="rv-nav-btn"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable strip */}
      <div className="rv-scroll-wrap" ref={scrollRef}>
        {visible.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </div>

      <style>{`
        .rv-section {
          position: relative;
          margin: 28px 0 12px;
          padding: 0 12px;
        }
        @media (min-width: 640px) {
          .rv-section { padding: 0 32px; margin: 36px 0 16px; }
        }

        .rv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .rv-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rv-header-icon {
          width: 18px;
          height: 18px;
          color: ${t.bluePrimary};
        }
        .rv-title {
          font-size: 17px;
          font-weight: 800;
          color: ${t.textPrimary};
          letter-spacing: -0.01em;
        }
        @media (min-width: 640px) {
          .rv-title { font-size: 20px; }
        }

        /* Desktop nav arrows */
        .rv-nav-arrows {
          display: none;
          gap: 6px;
        }
        @media (min-width: 640px) {
          .rv-nav-arrows { display: flex; }
        }
        .rv-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid ${t.border};
          background: #FFF;
          color: ${t.textPrimary};
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .rv-nav-btn:hover:not(:disabled) {
          background: ${t.bgBlueTint};
          border-color: ${t.bluePrimary};
          color: ${t.bluePrimary};
        }
        .rv-nav-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }

        /* Scrollable container */
        .rv-scroll-wrap {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .rv-scroll-wrap::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) {
          .rv-scroll-wrap { gap: 14px; }
        }

        /* Card */
        .rv-card {
          flex-shrink: 0;
          width: 140px;
          scroll-snap-align: start;
          border-radius: 12px;
          border: 1px solid ${t.border};
          background: #FFF;
          overflow: hidden;
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          flex-direction: column;
        }
        .rv-card:hover {
          border-color: rgba(26,111,212,0.2);
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        @media (min-width: 640px) {
          .rv-card { width: 165px; }
        }

        .rv-card-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: ${t.bgBlueTint};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .rv-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .rv-card:hover .rv-card-img img {
          transform: scale(1.06);
        }
        .rv-card-img-placeholder {
          color: ${t.bluePrimary};
          opacity: 0.25;
          width: 28px;
          height: 28px;
        }

        .rv-card-body {
          padding: 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .rv-card-name {
          font-size: 12.5px;
          font-weight: 600;
          color: ${t.textPrimary};
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 6px;
        }
        @media (min-width: 640px) {
          .rv-card-name { font-size: 13px; }
        }

        .rv-card-price-row {
          margin-top: auto;
          display: flex;
          align-items: baseline;
          gap: 4px;
          flex-wrap: wrap;
        }
        .rv-card-price {
          font-size: 14px;
          font-weight: 800;
          color: ${t.textPrimary};
        }
        .rv-card-orig-price {
          font-size: 11px;
          color: ${t.textMuted || "#9CA3AF"};
          text-decoration: line-through;
        }
        .rv-card-discount {
          font-size: 10.5px;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 1px 5px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}

function RecentCard({ item }: { item: RecentlyViewedItem }) {
  const discount =
    item.originalPrice > item.price
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100
        )
      : 0;

  return (
    <Link href={`/products/${item.id}`} className="rv-card">
      <div className="rv-card-img">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <PackageOpen className="rv-card-img-placeholder" />
        )}
      </div>
      <div className="rv-card-body">
        <p className="rv-card-name">{item.name}</p>
        <div className="rv-card-price-row">
          <span className="rv-card-price">{formatINR(item.price)}</span>
          {discount > 0 && (
            <>
              <span className="rv-card-orig-price">
                {formatINR(item.originalPrice)}
              </span>
              <span className="rv-card-discount">-{discount}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
