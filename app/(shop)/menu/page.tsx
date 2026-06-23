"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
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
  // Icons for popular categories
  Ribbon,
  BookOpen,
  CircleDot,
  Gem,
  Footprints,
  RectangleHorizontal,
  Sofa,
  PanelTop,
  Flower2
} from "lucide-react";
import { useCategories } from "@/lib/useCategories";

/* ─── Brand palette ─── */
const BRAND = {
  primary: "#146EB4",
  primaryLight: "#E8F1FA",
  primaryMid: "#C4DCF0",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bg: "#F7F8FA",
  bgCard: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  iconDefault: "#6B7280",
  iconActive: "#146EB4",
};



/* ─── Popular section data — icons instead of emojis ─── */
interface PopularItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const FEATURED_ITEMS: PopularItem[] = [
  { label: "New Arrivals", icon: Sparkles,   href: "/search?q=new+arrivals" },
  { label: "Trending Now", icon: TrendingUp, href: "/search?q=trending" },
  { label: "Top Brands",   icon: Crown,      href: "/search?q=top+brands" },
  { label: "Gift Ideas",   icon: Gift,       href: "/search?q=gifts" },
];

const POPULAR_CATEGORIES: { label: string; icon: React.ElementType; href: string }[] = [
  { label: "Sarees",       icon: Ribbon,                 href: "/search?q=sarees" },
  { label: "Kurtas",       icon: BookOpen,                href: "/search?q=kurtas" },
  { label: "T-Shirts",     icon: Shirt,                   href: "/search?q=t-shirts" },
  { label: "Jeans",        icon: CircleDot,               href: "/search?q=jeans" },
  { label: "Dresses",      icon: Shirt,                   href: "/search?q=dresses" },
  { label: "Jewellery",    icon: Gem,                     href: "/search?q=jewellery" },
  { label: "Footwear",     icon: Footprints,              href: "/search?q=footwear" },
  { label: "Bed Sheets",   icon: RectangleHorizontal,     href: "/search?q=bed+sheets" },
  { label: "Cushions",     icon: Sofa,                    href: "/search?q=cushions" },
  { label: "Curtains",     icon: PanelTop,                href: "/search?q=curtains" },
  { label: "Towels",       icon: RectangleHorizontal,     href: "/search?q=towels" },
  { label: "Home Decor",   icon: Flower2,                 href: "/search?q=home+decor" },
];

export default function MobileMenuPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("POPULAR");
  const { tabs: categoriesTree } = useCategories();

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

  const activeMeta = categoriesTree.find((c) => c.slug === activeCategory);

  return (
    <div
      className="flex-1 flex flex-col bg-white md:hidden overflow-hidden"
    >
      {/* ── Sticky Header ── */}
      <header
        className="flex items-center gap-3 px-4 h-14 sticky top-0 z-50 shrink-0"
        style={{
          background: BRAND.bgCard,
          borderBottom: `1px solid ${BRAND.borderLight}`,
        }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BRAND.text }} />
        </button>
        <h1
          className="text-[17px] font-medium tracking-tight flex-1"
          style={{ color: BRAND.text }}
        >
          Categories
        </h1>
        <Link
          href="/search"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Search className="w-5 h-5" style={{ color: BRAND.textSecondary }} />
        </Link>
      </header>

      {/* ── Split Panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Category List ── */}
        <aside
          className="w-[88px] shrink-0 overflow-y-auto"
          style={{
            background: BRAND.bg,
            borderRight: `1px solid ${BRAND.borderLight}`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overscrollBehavior: "contain",
            paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <style>{`
            .menu-aside::-webkit-scrollbar { display: none; }
          `}</style>
          <div className="flex flex-col menu-aside">
            {/* Hardcoded Popular Tab */}
            <button
              onClick={() => setActiveCategory("POPULAR")}
              className="relative flex flex-col items-center gap-1.5 py-3.5 px-2 transition-all"
              style={{ background: activeCategory === "POPULAR" ? BRAND.bgCard : "transparent" }}
            >
              {activeCategory === "POPULAR" && <div className="absolute left-0 top-2 bottom-2 rounded-r-full" style={{ width: 3, background: BRAND.primary }} />}
              <div className="relative flex items-center justify-center transition-all" style={{ width: 52, height: 52, background: "transparent" }}>
                <img src="https://plfaugkadavxenpqawzw.supabase.co/storage/v1/object/public/category-icons/admin/1782232167452-popular_star_1782232042372.png" alt="Popular" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply", filter: "contrast(1.05) brightness(1.05)", transform: "scale(1.35)" }} />
              </div>
              <span className="relative text-center leading-tight transition-colors" style={{ fontSize: "11.5px", fontWeight: activeCategory === "POPULAR" ? 700 : 500, color: activeCategory === "POPULAR" ? BRAND.primary : BRAND.textSecondary, letterSpacing: "0.01em", maxWidth: 76 }}>
                Popular
              </span>
            </button>

            {categoriesTree.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="relative flex flex-col items-center gap-1.5 py-3.5 px-2 transition-all"
                  style={{
                    background: isActive ? BRAND.bgCard : "transparent",
                  }}
                >
                  {/* Active indicator bar — left edge */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-2 bottom-2 rounded-r-full"
                      style={{
                        width: 3,
                        background: BRAND.primary,
                      }}
                    />
                  )}

                  {/* Icon circle / fallback */}
                  <div
                    className="relative flex items-center justify-center transition-all"
                    style={{
                      width: 52,
                      height: 52,
                      background: "transparent",
                    }}
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply", filter: "contrast(1.05) brightness(1.05)", transform: "scale(1.35)" }} />
                    ) : (
                      <span className="text-[14px] font-bold uppercase" style={{ color: isActive ? BRAND.primary : BRAND.iconDefault }}>
                        {cat.name.substring(0, 2)}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="relative text-center leading-tight transition-colors"
                    style={{
                      fontSize: "11.5px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? BRAND.primary : BRAND.textSecondary,
                      letterSpacing: "0.01em",
                      maxWidth: 76,
                    }}
                  >
                    {cat.name}
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
                  <h3
                    className="text-[10px] font-black uppercase tracking-widest mb-3 px-0.5"
                    style={{ color: BRAND.textMuted }}
                  >
                    Featured
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {FEATURED_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="relative flex flex-col justify-end overflow-hidden rounded-2xl active:scale-[0.97] transition-all"
                          style={{
                            height: 110,
                            background: BRAND.primaryLight,
                            border: `1px solid ${BRAND.border}`,
                          }}
                        >
                          {/* Large decorative icon — top-right */}
                          <Icon
                            className="absolute top-3 right-3 opacity-[0.08]"
                            style={{ width: 52, height: 52, color: BRAND.primary }}
                          />
                          {/* Foreground icon — top-left */}
                          <div
                            className="absolute top-3 left-3 flex items-center justify-center rounded-xl"
                            style={{
                              width: 36,
                              height: 36,
                              background: BRAND.primaryMid,
                            }}
                          >
                            <Icon style={{ width: 18, height: 18, color: BRAND.primary }} />
                          </div>
                          {/* Label at bottom */}
                          <div className="px-3 pb-3 pt-2">
                            <span
                              className="text-[12px] font-bold leading-tight block"
                              style={{ color: BRAND.text }}
                            >
                              {item.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Categories — icons instead of emojis */}
                <div>
                  <h3
                    className="text-[10px] font-black uppercase tracking-widest mb-3 px-0.5"
                    style={{ color: BRAND.textMuted }}
                  >
                    Popular Categories
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {POPULAR_CATEGORIES.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border hover:shadow-sm active:scale-[0.97] transition-all text-center"
                          style={{
                            borderColor: BRAND.borderLight,
                            background: BRAND.bgCard,
                          }}
                        >
                          <div
                            className="flex items-center justify-center rounded-lg"
                            style={{
                              width: 32,
                              height: 32,
                              background: BRAND.bg,
                            }}
                          >
                            <Icon
                              style={{
                                width: 16,
                                height: 16,
                                color: BRAND.textSecondary,
                                strokeWidth: 1.8,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10.5px] font-semibold leading-tight"
                            style={{ color: BRAND.text }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* ── Category Subcategories ── */
              <>
                {/* Subcategory Group */}
                <div className="grid grid-cols-3 gap-y-6 gap-x-2 pt-2">
                  {activeMeta?.children.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/search?q=${encodeURIComponent(item.name)}`}
                      className="flex flex-col items-center text-center gap-2 group active:scale-95 transition-transform"
                    >
                      <div
                        className="flex items-center justify-center transition-shadow group-hover:shadow-sm"
                        style={{
                          width: 82,
                          height: 82,
                          background: "transparent",
                        }}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply", filter: "contrast(1.05) brightness(1.05)", transform: "scale(1.35)" }} />
                        ) : (
                          <img src="https://plfaugkadavxenpqawzw.supabase.co/storage/v1/object/public/category-icons/admin/1782233292873-placeholder_icon_1782233271674.png" alt="Placeholder" className="w-full h-full object-contain opacity-60" style={{ mixBlendMode: "multiply", transform: "scale(1.2)" }} />
                        )}
                      </div>
                      <span
                        className="text-[11.5px] font-semibold leading-tight group-hover:text-gray-900 transition-colors"
                        style={{ color: BRAND.text, maxWidth: 76 }}
                      >
                        {item.name}
                      </span>
                    </Link>
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
