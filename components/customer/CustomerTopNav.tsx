"use client";

import Link from "next/link";
import {
  Search,
  Bell,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { topCategories, type TopCategory } from "@/lib/categoryData";
import MegaMenuDropdown from "./MegaMenuDropdown";
import MobileCategoryDrawer from "./MobileCategoryDrawer";

export default function CustomerTopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState<TopCategory | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMenu = useCallback((cat: TopCategory) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setActiveMenu(cat);
  }, []);

  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#E5E3FF] bg-white">
        {/* ── ROW 1: Utility bar (desktop only) ── */}
        <div className="hidden lg:block border-b border-[#E5E3FF] bg-[#F5F4FF]">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs text-[#6B7280]">
            <span>Free shipping on bulk orders above ₹50,000</span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-[#6C47FF] transition-colors">
                Sell on ANGA
              </a>
              <span className="text-[#E5E3FF]">|</span>
              <a href="#" className="hover:text-[#6C47FF] transition-colors">
                Download App
              </a>
              <span className="text-[#E5E3FF]">|</span>
              <a href="#" className="hover:text-[#6C47FF] transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Main header ── */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-[#1A1A2E] hover:bg-[#F5F4FF] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            href="/customer"
            className="shrink-0 text-[22px] font-bold text-[#6C47FF] tracking-tight"
          >
            ANGA
          </Link>

          {/* Search — desktop: always visible, mobile: toggle */}
          <div
            className={cn(
              "relative mx-auto transition-all",
              searchExpanded
                ? "absolute inset-x-4 top-3 z-10 sm:relative sm:inset-auto"
                : "hidden sm:block flex-1 max-w-[480px]"
            )}
          >
            <input
              type="text"
              placeholder="Search products, categories, sellers..."
              className="h-10 w-full rounded-full border border-[#E5E3FF] bg-white pl-4 pr-11 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
              onBlur={() => setSearchExpanded(false)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#6C47FF] text-white">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Search icon (small mobile only) */}
          <button
            onClick={() => setSearchExpanded(true)}
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full text-[#1A1A2E] hover:bg-[#F5F4FF] transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* Alerts */}
            <button className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#F5F4FF] transition-colors">
              <div className="relative">
                <Bell className="h-[22px] w-[22px] text-[#1A1A2E]" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  2
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280] hidden sm:block">
                Alerts
              </span>
            </button>

            {/* Wishlist */}
            <Link
              href="/customer/wishlist"
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#F5F4FF] transition-colors"
            >
              <div className="relative">
                <Heart className="h-[22px] w-[22px] text-[#1A1A2E]" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  4
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280] hidden sm:block">
                Wishlist
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/customer/cart"
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#F5F4FF] transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="h-[22px] w-[22px] text-[#1A1A2E]" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#6C47FF] text-[8px] font-bold text-white">
                  3
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280] hidden sm:block">
                Cart
              </span>
            </Link>

            {/* Account */}
            <Link
              href="/customer/account"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#F5F4FF] transition-colors"
            >
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#6C47FF] text-[9px] font-bold text-white">
                RK
              </div>
              <span className="text-[11px] text-[#6B7280] hidden sm:block">
                Account
              </span>
            </Link>
          </div>
        </div>

        {/* ── ROW 3: Category nav bar (desktop only) ── */}
        <div className="hidden lg:block border-t border-[#F0EFFF] relative">
          <div className="mx-auto max-w-7xl px-6">
            <nav className="flex -mb-px">
              {topCategories.map((cat) => (
                <button
                  key={cat}
                  onMouseEnter={() => showMenu(cat)}
                  onMouseLeave={scheduleHide}
                  className={cn(
                    "shrink-0 h-11 flex items-center px-5 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors border-b-2 whitespace-nowrap",
                    activeMenu === cat
                      ? "text-[#6C47FF] border-[#6C47FF]"
                      : "text-[#1A1A2E] border-transparent hover:text-[#6C47FF] hover:border-[#6C47FF]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Mega menu dropdown */}
          {activeMenu && (
            <MegaMenuDropdown
              category={activeMenu}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
            />
          )}
        </div>
      </header>

      {/* Mobile category drawer */}
      <MobileCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
