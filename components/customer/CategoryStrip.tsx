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
    <div className="sticky top-16 z-30 border-b border-anga-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                active === cat
                  ? "border-[#6C47FF] text-[#6C47FF]"
                  : "border-transparent text-anga-text-secondary hover:text-anga-text hover:border-anga-border"
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
