"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Electronics",
  "Home Decor",
  "Furniture",
  "Office Essentials",
  "Industrial",
  "Retail",
];

export default function CategoryStrip() {
  const [active, setActive] = useState("All");

  return (
    <div className="sticky top-16 z-30 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "shrink-0 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap",
                active === cat
                  ? "border-[#146EB4] text-[#146EB4] font-medium"
                  : "border-transparent text-[#6B7280] font-normal hover:text-[#1F2937] hover:border-[#E5E7EB]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
