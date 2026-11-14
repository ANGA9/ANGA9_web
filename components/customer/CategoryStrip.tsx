"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { useCategories, type CategoryTab } from "@/lib/useCategories";
import MegaDropdown from "./MegaDropdown";

export default function CategoryStrip() {
  const { tabs, loading } = useCategories();
  const [hoveredTab, setHoveredTab] = useState<CategoryTab | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropdown = useCallback((tab: CategoryTab) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setHoveredTab(tab);
  }, []);

  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  }, []);

  const closeDropdown = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setHoveredTab(null);
  }, []);

  // Keep the strip's height while loading so the layout doesn't jump;
  // render nothing at all if the API returned no categories.
  if (!loading && tabs.length === 0) return null;

  return (
    <>
      <div
        className="relative z-40 border-b"
        style={{ background: t.bgCard, borderColor: t.border }}
      >
        <div className="mx-auto relative" style={{ maxWidth: 1400, padding: "0 48px" }}>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px" style={{ minHeight: 44 }}>
            {/* Mega-menu tabs — driven by the real categories table */}
            {tabs.map((tab) => (
              <Link
                key={tab.slug}
                href={`/search?category=${encodeURIComponent(tab.name)}`}
                onMouseEnter={() => showDropdown(tab)}
                onMouseLeave={scheduleHide}
                onClick={closeDropdown}
                className="shrink-0 h-11 flex items-center px-4 text-sm font-medium transition-colors border-b-[3px] whitespace-nowrap uppercase"
                style={{
                  borderColor: hoveredTab?.slug === tab.slug ? t.bluePrimary : "transparent",
                  color: hoveredTab?.slug === tab.slug ? t.bluePrimary : t.textPrimary,
                  fontWeight: 500,
                }}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* Mega dropdown — aligned to content area */}
          {hoveredTab && (
            <MegaDropdown
              tab={hoveredTab}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
              onNavigate={closeDropdown}
            />
          )}
        </div>

      </div>

      {/* Dark overlay — covers only content below the fixed header */}
      {hoveredTab && (
        <div
          className="fixed inset-x-0 bottom-0 top-[188px] z-[34]"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onMouseEnter={scheduleHide}
        />
      )}
    </>
  );
}
