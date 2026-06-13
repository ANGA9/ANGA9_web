import Link from "next/link";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import type { CategoryTab } from "@/lib/useCategories";

interface MegaDropdownProps {
  tab: CategoryTab;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  /** Close the dropdown after a navigation click */
  onNavigate: () => void;
}

const ITEMS_PER_COLUMN = 5;

/** Search filters by category_name (exact ES term match), so links pass the name. */
function searchHref(categoryName: string): string {
  return `/search?category=${encodeURIComponent(categoryName)}`;
}

export default function MegaDropdown({
  tab,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: MegaDropdownProps) {
  if (tab.children.length === 0) return null;

  // Chunk children into columns for the multi-column layout
  const columns: CategoryTab["children"][] = [];
  for (let i = 0; i < tab.children.length; i += ITEMS_PER_COLUMN) {
    columns.push(tab.children.slice(i, i + ITEMS_PER_COLUMN));
  }

  return (
    <div
      className="absolute left-0 top-full z-50"
      style={{
        animation: "megaFadeIn 150ms ease forwards",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style>{`
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="flex items-stretch rounded-b-xl border border-t-0 overflow-hidden"
        style={{
          background: "#FFFFFF",
          borderColor: t.border,
          boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
          width: "max-content",
        }}
      >
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="min-w-[160px] px-6 py-6"
            style={{
              background: idx % 2 === 1 ? t.bgBlueTint : "#FFFFFF",
            }}
          >
            {idx === 0 && (
              <h4
                className="text-sm md:text-base font-bold uppercase tracking-[0.04em] pb-1.5 mb-2.5"
                style={{
                  color: t.bluePrimary,
                  borderBottom: `2px solid ${t.bluePrimary}`,
                }}
              >
                <Link href={searchHref(tab.name)} onClick={onNavigate} className="hover:underline">
                  All {tab.name}
                </Link>
              </h4>
            )}
            <ul className="space-y-1">
              {col.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={searchHref(item.name)}
                    onClick={onNavigate}
                    className="block text-sm md:text-[15px] leading-[1.6] py-0.5 transition-colors hover:text-[#1A6FD4] text-left w-full"
                    style={{ color: t.textPrimary }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
