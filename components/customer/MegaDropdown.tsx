import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

interface Column {
  heading: string;
  items: string[];
}

const dropdownData: Record<string, Column[]> = {
  FASHION: [
    { heading: "Menswear", items: ["Tops", "Bottoms", "Outerwear", "Innerwear"] },
    { heading: "Womenswear", items: ["Tops", "Bottoms", "Dresses", "Ethnic/Traditional", "Lingerie/Intimates"] },
    { heading: "Kids & Infants", items: ["Boys", "Girls", "Infants/Toddlers"] },
    { heading: "Activewear", items: ["Gym & Training", "Sports Specific"] },
    { heading: "Menswear Items", items: ["T-shirts", "Polo shirts", "Jeans", "Chinos", "Blazers", "Hoodies", "Briefs", "Socks"] },
    { heading: "Womenswear Items", items: ["Blouses", "Crop tops", "Skirts", "Leggings", "Sarees", "Kurtas", "Maxi dresses", "Gowns"] },
  ],
  ACCESSORIES: [
    { heading: "Headwear", items: ["Beanies", "Caps", "Berets"] },
    { heading: "Neckwear", items: ["Ties", "Scarves", "Bowties"] },
    { heading: "Handwear", items: ["Gloves", "Mittens"] },
  ],
  "BED & BATH LINEN": [
    { heading: "Bedding", items: ["Bed Linen", "Bedding Essentials", "Decorative"] },
    { heading: "Bath Linen", items: ["Towels", "Accessories"] },
    { heading: "Table Linen", items: ["Dining Essentials", "Service Items"] },
    { heading: "Kitchen Textiles", items: ["Utilities", "Cleaning"] },
  ],
  "HOME DECOR & FLOORING": [
    { heading: "Window Treatments", items: ["Curtains", "Blinds & Shades", "Hardware"] },
    { heading: "Floor Coverings", items: ["Rugs & Carpets", "Mats"] },
    { heading: "Living & Decor", items: ["Cushions & Covers", "Upholstery", "Wall Textiles"] },
  ],
};

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
  const columns = dropdownData[tab];
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
            className="min-w-[190px] px-8 py-7"
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
