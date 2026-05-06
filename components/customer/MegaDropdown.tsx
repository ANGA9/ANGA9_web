import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

interface Column {
  heading: string;
  items: string[];
}

const dropdownData: Record<string, Column[]> = {
  WOMENSWEAR: [
    { heading: "Tops", items: ["Blouses", "Crop tops", "Tunics", "Bodysuits"] },
    { heading: "Bottoms", items: ["Skirts", "Leggings", "Palazzos", "Jeans", "Culottes"] },
    { heading: "Dresses", items: ["Maxi dresses", "Cocktail dresses", "Sundress", "Gowns"] },
    { heading: "Ethnic/Traditional", items: ["Sarees", "Kurtas", "Kimonos", "Abayas"] },
    { heading: "Lingerie/Intimates", items: ["Bras", "Panties", "Shapewear", "Nightgowns"] },
  ],
  MENSWEAR: [
    { heading: "Tops", items: ["T-shirts", "Polo shirts", "Casual shirts", "Formal shirts"] },
    { heading: "Bottoms", items: ["Jeans", "Chinos", "Dress pants", "Cargo pants", "Shorts"] },
    { heading: "Outerwear", items: ["Blazers", "Leather jackets", "Hoodies", "Overcoats"] },
    { heading: "Innerwear", items: ["Briefs", "Boxers", "Undershirts", "Socks"] },
  ],
  "KIDS & INFANTS": [
    { heading: "Boys", items: ["Graphic tees", "Denim", "Rompers", "School uniforms"] },
    { heading: "Girls", items: ["Frocks", "Leggings", "Tutus", "Hair accessories"] },
    { heading: "Infants/Toddlers", items: ["Onesies", "Sleepsuits", "Bibs", "Swaddles"] },
  ],
  ACTIVEWEAR: [
    { heading: "Gym & Training", items: ["Performance tees", "Compression leggings", "Tracksuits"] },
    { heading: "Sports Specific", items: ["Football jerseys", "Swimwear", "Yoga wear"] },
  ],
  ACCESSORIES: [
    { heading: "Headwear", items: ["Beanies", "Caps", "Berets"] },
    { heading: "Neckwear", items: ["Ties", "Scarves", "Bowties"] },
    { heading: "Handwear", items: ["Gloves", "Mittens"] },
  ],
  "BED, BATH & KITCHEN": [
    { heading: "Bed Linen", items: ["Bed sheets", "Pillowcases", "Duvet covers"] },
    { heading: "Bedding Essentials", items: ["Pillows", "Quilts", "Comforters", "Mattress protectors"] },
    { heading: "Decorative Bedding", items: ["Bed runners", "Euro shams", "Bed skirts"] },
    { heading: "Bath Linen", items: ["Hand towels", "Bath towels", "Washcloths", "Shower curtains", "Bathrobes", "Toilet seat covers"] },
    { heading: "Table Linen", items: ["Tablecloths", "Table runners", "Placemats", "Cloth napkins", "Coasters", "Tea cozies"] },
    { heading: "Kitchen Textiles", items: ["Aprons", "Oven mitts", "Pot holders", "Dish towels", "Microfiber cloths"] },
  ],
  "HOME DECOR & FLOORING": [
    { heading: "Curtains & Hardware", items: ["Blackout curtains", "Sheers", "Cafe curtains", "Curtain rods", "Finials", "Tie-backs"] },
    { heading: "Blinds & Shades", items: ["Roller blinds", "Roman shades", "Venetian blinds"] },
    { heading: "Rugs & Carpets", items: ["Area rugs", "Runners", "Shag carpets", "Persian rugs"] },
    { heading: "Floor Mats", items: ["Doormats", "Bath mats", "Kitchen mats"] },
    { heading: "Cushions & Covers", items: ["Throw pillows", "Bolsters", "Floor cushions", "Sofa covers", "Chair pads", "Slipcovers"] },
    { heading: "Wall Textiles", items: ["Tapestries", "Macramé wall hangings"] },
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
