import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { CATEGORY_TREE } from "@/lib/categories";

interface MegaDropdownProps {
  tab: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function MegaDropdown({
  tab,
  onMouseEnter,
  onMouseLeave,
}: MegaDropdownProps) {
  const columns = CATEGORY_TREE[tab];
  if (!columns) return null;

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
            key={col.heading} 
            className="min-w-[160px] px-6 py-6"
            style={{
              background: idx % 2 === 1 ? t.bgBlueTint : "#FFFFFF"
            }}
          >
            <h4
              className="text-sm md:text-base font-bold uppercase tracking-[0.04em] pb-1.5 mb-2.5"
              style={{
                color: t.bluePrimary,
                borderBottom: `2px solid ${t.bluePrimary}`,
              }}
            >
              {col.heading}
            </h4>
            <ul className="space-y-1">
              {col.items.map((item) => (
                <li key={item}>
                  <button
                    className="block text-sm md:text-[15px] leading-[1.6] py-0.5 transition-colors hover:text-[#1A6FD4] text-left w-full"
                    style={{ color: t.textPrimary }}
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
  );
}
