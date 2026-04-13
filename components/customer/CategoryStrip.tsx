"use client";

import { useState, useRef, useCallback } from "react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import MegaDropdown from "./MegaDropdown";

const megaTabs = [
  "FASHION",
  "ACCESSORIES",
  "BED & BATH LINEN",
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
        className="sticky top-[130px] z-30 border-b relative"
        style={{ background: t.bgCard, borderColor: t.border }}
      >
        <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 24px" }}>
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
                    borderColor: isHovered ? t.bluePrimary : "transparent",
                    color: t.textPrimary,
                    fontWeight: isHovered ? 600 : 500,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mega dropdown */}
        {hoveredTab && (
          <MegaDropdown
            tab={hoveredTab}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          />
        )}
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
