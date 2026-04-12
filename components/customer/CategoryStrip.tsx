"use client";

import { useState } from "react";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

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
    <div
      className="sticky top-16 z-30 border-b"
      style={{ background: t.bgCard, borderColor: t.border }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2.5 -mb-px">
          {categories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  background: isActive ? t.bluePrimary : "transparent",
                  color: isActive ? "#FFFFFF" : t.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.color =
                      t.bluePrimary;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.color =
                      t.textSecondary;
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
