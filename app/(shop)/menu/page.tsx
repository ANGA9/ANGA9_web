"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import {
  Shirt,
  UserRound,
  Baby,
  Dumbbell,
  Watch,
  BedDouble,
  Lamp,
  Star,
  Sparkles,
  TrendingUp,
  Crown,
  Gift,
  ChevronRight,
} from "lucide-react";
import { CATEGORY_TREE, type CategoryColumn } from "@/lib/categories";

/* ─── Category meta with icons & colors ─── */
interface CategoryMeta {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "POPULAR",
    label: "Popular",
    icon: Star,
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  {
    key: "WOMENSWEAR",
    label: "Women",
    icon: Shirt,
    color: "#E0598B",
    bgColor: "#FDE8EF",
  },
  {
    key: "MENSWEAR",
    label: "Men",
    icon: UserRound,
    color: "#2563EB",
    bgColor: "#DBEAFE",
  },
  {
    key: "KIDS & INFANTS",
    label: "Kids & Baby",
    icon: Baby,
    color: "#16A34A",
    bgColor: "#DCFCE7",
  },
  {
    key: "ACTIVEWEAR",
    label: "Activewear",
    icon: Dumbbell,
    color: "#DC2626",
    bgColor: "#FEE2E2",
  },
  {
    key: "ACCESSORIES",
    label: "Accessories",
    icon: Watch,
    color: "#7C3AED",
    bgColor: "#EDE9FE",
  },
  {
    key: "BED, BATH & KITCHEN",
    label: "Bed & Bath",
    icon: BedDouble,
    color: "#0891B2",
    bgColor: "#CFFAFE",
  },
  {
    key: "HOME DECOR & FLOORING",
    label: "Home Decor",
    icon: Lamp,
    color: "#CA8A04",
    bgColor: "#FEF9C3",
  },
];

/* ─── Popular section data ─── */
interface PopularItem {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href: string;
}

const FEATURED_ITEMS: PopularItem[] = [
  { label: "New Arrivals", icon: Sparkles, color: "#7C3AED", bgColor: "#EDE9FE", href: "/search?q=new+arrivals" },
  { label: "Trending Now", icon: TrendingUp, color: "#E0598B", bgColor: "#FDE8EF", href: "/search?q=trending" },
  { label: "Top Brands", icon: Crown, color: "#F59E0B", bgColor: "#FEF3C7", href: "/search?q=top+brands" },
  { label: "Gift Ideas", icon: Gift, color: "#DC2626", bgColor: "#FEE2E2", href: "/search?q=gifts" },
];

const POPULAR_CATEGORIES: { label: string; href: string }[] = [
  { label: "Sarees", href: "/search?q=sarees" },
  { label: "Kurtas & Kurtis", href: "/search?q=kurtas" },
  { label: "T-shirts", href: "/search?q=t-shirts" },
  { label: "Jeans", href: "/search?q=jeans" },
  { label: "Dresses", href: "/search?q=dresses" },
  { label: "Jewellery", href: "/search?q=jewellery" },
  { label: "Footwear", href: "/search?q=footwear" },
  { label: "Bed Sheets", href: "/search?q=bed+sheets" },
  { label: "Cushions", href: "/search?q=cushions" },
  { label: "Curtains", href: "/search?q=curtains" },
  { label: "Towels", href: "/search?q=towels" },
  { label: "Home Decor", href: "/search?q=home+decor" },
];

export default function MobileMenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("POPULAR");

  // Redirect desktop visitors to home — this page is mobile-only
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) router.replace("/");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) router.replace("/");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [router]);

  const activeMeta = CATEGORIES.find((c) => c.key === activeCategory);
  const columns: CategoryColumn[] = CATEGORY_TREE[activeCategory] || [];

  return (
    <div
      className="flex flex-col bg-white md:hidden"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        overflow: "hidden",
      }}
    >
      {/* ── Sticky Header ── */}
      <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-50 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="text-[17px] font-medium text-gray-900 tracking-tight flex-1">
          Categories
        </h1>
        <Link
          href="/search"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </Link>
      </header>

      {/* ── Split Panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Category List ── */}
        <aside
          className="w-[88px] shrink-0 overflow-y-auto border-r border-gray-100"
          style={{
            background: "#F8F9FB",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overscrollBehavior: "contain",
            paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <style>{`
            .menu-aside::-webkit-scrollbar { display: none; }
            @keyframes catIconBounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
          `}</style>
          <div className="flex flex-col menu-aside">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className="relative flex flex-col items-center gap-1.5 py-4 px-1 transition-all"
                  style={{
                    background: isActive ? "#FFFFFF" : "transparent",
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                      style={{ background: cat.color }}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: 44,
                      height: 44,
                      background: isActive ? cat.bgColor : "#F0F1F3",
                      boxShadow: isActive
                        ? `0 2px 8px ${cat.color}20`
                        : "none",
                      animation: isActive
                        ? "catIconBounce 0.3s ease"
                        : "none",
                    }}
                  >
                    <Icon
                      className="transition-colors"
                      style={{
                        width: 20,
                        height: 20,
                        color: isActive ? cat.color : "#9CA3AF",
                        strokeWidth: isActive ? 2.2 : 1.8,
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="text-center leading-tight transition-colors"
                    style={{
                      fontSize: "10px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? cat.color : "#6B7280",
                      letterSpacing: "0.01em",
                      maxWidth: 76,
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── RIGHT: Subcategories ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overscrollBehavior: "contain",
          }}
        >
          <style>{`
            .subcat-panel::-webkit-scrollbar { display: none; }
            @keyframes subcatSlideIn {
              from { opacity: 0; transform: translateX(8px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          <div
            className="subcat-panel p-4"
            key={activeCategory}
            style={{
              paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
              animation: "subcatSlideIn 200ms ease",
            }}
          >
            {activeCategory === "POPULAR" ? (
              /* ── Popular Tab Content ── */
              <>
                {/* Featured Section */}
                <div className="mb-5">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-0.5">
                    Featured
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {FEATURED_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md active:scale-[0.97] transition-all"
                          style={{
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            className="flex items-center justify-center rounded-xl"
                            style={{
                              width: 48,
                              height: 48,
                              background: item.bgColor,
                            }}
                          >
                            <Icon
                              style={{
                                width: 22,
                                height: 22,
                                color: item.color,
                              }}
                            />
                          </div>
                          <span className="text-[12px] font-bold text-gray-700 text-center leading-tight">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Categories */}
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-0.5">
                    Popular Categories
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {POPULAR_CATEGORIES.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-center p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm active:scale-[0.97] transition-all text-center"
                      >
                        <span className="text-[11.5px] font-semibold text-gray-700 leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* ── Category Subcategories ── */
              <>
                {/* Category Banner */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
                  style={{
                    background: activeMeta
                      ? `linear-gradient(135deg, ${activeMeta.bgColor}, #FFFFFF)`
                      : "#F8F9FB",
                    border: `1px solid ${activeMeta?.color}15`,
                  }}
                >
                  {activeMeta && (
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width: 40,
                        height: 40,
                        background: activeMeta.bgColor,
                      }}
                    >
                      <activeMeta.icon
                        style={{
                          width: 20,
                          height: 20,
                          color: activeMeta.color,
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-[15px] font-black tracking-tight"
                      style={{ color: activeMeta?.color || "#1A1A2E" }}
                    >
                      {activeMeta?.label || activeCategory}
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {columns.reduce((sum, col) => sum + col.items.length, 0)}{" "}
                      items
                    </p>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      activeMeta?.label || activeCategory
                    )}`}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      color: activeMeta?.color || "#1A6FD4",
                      background: activeMeta?.bgColor || "#EAF2FF",
                    }}
                  >
                    View All
                  </Link>
                </div>

                {/* Subcategory Groups */}
                <div className="flex flex-col gap-4">
                  {columns.map((col) => (
                    <div key={col.heading}>
                      {/* Group heading */}
                      <div className="flex items-center gap-2 mb-2 px-0.5">
                        <h3
                          className="text-[11px] font-black uppercase tracking-widest"
                          style={{
                            color: activeMeta?.color || "#6B7280",
                          }}
                        >
                          {col.heading}
                        </h3>
                        <div
                          className="flex-1 h-px"
                          style={{
                            background: `${activeMeta?.color || "#E5E7EB"}20`,
                          }}
                        />
                      </div>

                      {/* Items grid */}
                      <div className="flex flex-col">
                        {col.items.map((item, idx) => (
                          <Link
                            key={item}
                            href={`/search?q=${encodeURIComponent(item)}`}
                            className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                            style={{
                              borderBottom:
                                idx < col.items.length - 1
                                  ? "1px solid #F3F4F6"
                                  : "none",
                            }}
                          >
                            {/* Item icon placeholder */}
                            <div
                              className="flex items-center justify-center rounded-lg shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                background: "#F8F9FB",
                                border: "1px solid #F0F1F3",
                              }}
                            >
                              <span
                                className="text-[14px] font-bold"
                                style={{
                                  color: activeMeta?.color || "#9CA3AF",
                                  opacity: 0.7,
                                }}
                              >
                                {item.charAt(0)}
                              </span>
                            </div>

                            <span className="flex-1 text-[13.5px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                              {item}
                            </span>

                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
