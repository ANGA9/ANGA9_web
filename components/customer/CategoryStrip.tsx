"use client";

import { useState, useRef, useCallback } from "react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import MegaDropdown from "./MegaDropdown";

const megaTabs = [
  "WOMENSWEAR",
  "MENSWEAR",
  "KIDS & INFANTS",
  "ACTIVEWEAR",
  "ACCESSORIES",
  "BED, BATH & KITCHEN",
  "HOME DECOR & FLOORING",
];

export default function CategoryStrip() {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropdown = useCallback((tab: string) => {
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

  return (
    <>
      <div
        className="sticky top-[145px] z-30 border-b"
        style={{ background: t.bgCard, borderColor: t.border }}
      >
        <div className="mx-auto relative" style={{ maxWidth: 1400, padding: "0 48px" }}>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {/* Mega-menu tabs */}
            {megaTabs.map((tab) => {
              const isHovered = hoveredTab === tab;
              return (
                <button
                  key={tab}
                  onMouseEnter={() => showDropdown(tab)}
                  onMouseLeave={scheduleHide}
                  className="shrink-0 h-11 flex items-center px-4 text-sm font-medium transition-colors border-b-[3px] whitespace-nowrap"
                  style={{
                    borderColor: "transparent",
                    color: t.textPrimary,
                    fontWeight: 500,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Mega dropdown — aligned to content area */}
          {hoveredTab && (
            <MegaDropdown
              tab={hoveredTab}
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
            />
          )}
        </div>

      </div>

      {/* Dark overlay behind mega dropdown */}
      {hoveredTab && (
        <div
          className="fixed inset-0 z-20"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onMouseEnter={scheduleHide}
        />
      )}
    </>
  );
}
