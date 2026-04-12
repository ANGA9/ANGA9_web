"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  megaMenuData,
  topCategories,
  type TopCategory,
} from "@/lib/categoryData";
import { cn } from "@/lib/utils";

interface MobileCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileCategoryDrawer({
  open,
  onClose,
}: MobileCategoryDrawerProps) {
  const [expanded, setExpanded] = useState<TopCategory | null>(null);

  const toggle = (cat: TopCategory) => {
    setExpanded((prev) => (prev === cat ? null : cat));
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E3FF]">
          <span className="text-lg font-bold text-[#6C47FF]">Categories</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F4FF] text-[#1A1A2E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category accordion */}
        <div className="py-2">
          {topCategories.map((cat) => {
            const isOpen = expanded === cat;
            const columns = megaMenuData[cat];

            return (
              <div key={cat} className="border-b border-[#F0EFFF]">
                {/* Top-level category button */}
                <button
                  onClick={() => toggle(cat)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#1A1A2E] hover:bg-[#F5F4FF] transition-colors"
                >
                  {cat}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#6B7280] transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Expanded sub-categories */}
                {isOpen && (
                  <div className="px-5 pb-4 space-y-4">
                    {columns.map((col) => (
                      <div key={col.heading}>
                        <h5 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#6C47FF] mb-1.5">
                          {col.heading}
                        </h5>
                        <ul className="space-y-0.5">
                          {col.items.map((item) => (
                            <li key={item}>
                              <button className="text-[13px] text-[#1A1A2E] py-1 hover:text-[#6C47FF] transition-colors text-left w-full">
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
