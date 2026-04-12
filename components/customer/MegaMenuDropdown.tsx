"use client";

import { megaMenuData, type TopCategory } from "@/lib/categoryData";

interface MegaMenuDropdownProps {
  category: TopCategory;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function MegaMenuDropdown({
  category,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuDropdownProps) {
  const columns = megaMenuData[category];
  if (!columns) return null;

  const isNarrow = category === "ACCESSORIES";

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 bg-white border-t-2 border-[#6C47FF]"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="mx-auto max-w-7xl px-12 py-7 overflow-y-auto"
        style={{ maxHeight: 520 }}
      >
        <div
          className="grid gap-x-6 gap-y-6"
          style={{
            gridTemplateColumns: isNarrow
              ? "repeat(3, 1fr)"
              : "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {columns.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6C47FF] mb-2.5"
              >
                {col.heading}
              </h4>
              <ul className="space-y-0">
                {col.items.map((item) => (
                  <li key={item}>
                    <button
                      className="text-[13px] text-[#1A1A2E] leading-[2] hover:text-[#6C47FF] hover:underline transition-colors cursor-pointer text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
