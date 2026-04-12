export const topCategories = [
  "FASHION",
  "ACCESSORIES",
  "BED & BATH LINEN",
  "HOME DECOR & FLOORING",
] as const;

export type TopCategory = (typeof topCategories)[number];

export interface CategoryColumn {
  heading: string;
  items: string[];
}

export const megaMenuData: Record<TopCategory, CategoryColumn[]> = {
  FASHION: [
    {
      heading: "Menswear — Tops",
      items: ["T-shirts", "Polo shirts", "Casual shirts", "Formal shirts"],
    },
    {
      heading: "Menswear — Bottoms",
      items: ["Jeans", "Chinos", "Dress pants", "Cargo pants", "Shorts"],
    },
    {
      heading: "Menswear — Outerwear",
      items: ["Blazers", "Leather jackets", "Hoodies", "Overcoats"],
    },
    {
      heading: "Menswear — Innerwear",
      items: ["Briefs", "Boxers", "Undershirts", "Socks"],
    },
    {
      heading: "Womenswear — Tops",
      items: ["Blouses", "Crop tops", "Tunics", "Bodysuits"],
    },
    {
      heading: "Womenswear — Bottoms",
      items: ["Skirts", "Leggings", "Palazzos", "Jeans", "Culottes"],
    },
    {
      heading: "Womenswear — Dresses",
      items: ["Maxi dresses", "Cocktail dresses", "Sundress", "Gowns"],
    },
    {
      heading: "Womenswear — Ethnic",
      items: ["Sarees", "Kurtas", "Kimonos", "Abayas"],
    },
    {
      heading: "Womenswear — Lingerie",
      items: ["Bras", "Panties", "Shapewear", "Nightgowns"],
    },
    {
      heading: "Kids — Boys",
      items: ["Graphic tees", "Denim", "Rompers", "School uniforms"],
    },
    {
      heading: "Kids — Girls",
      items: ["Frocks", "Leggings", "Tutus", "Hair accessories"],
    },
    {
      heading: "Infants & Toddlers",
      items: ["Onesies", "Sleepsuits", "Bibs", "Swaddles"],
    },
    {
      heading: "Activewear — Gym",
      items: ["Performance tees", "Compression leggings", "Tracksuits"],
    },
    {
      heading: "Activewear — Sports",
      items: ["Football jerseys", "Swimwear", "Yoga wear"],
    },
  ],
  ACCESSORIES: [
    {
      heading: "Headwear",
      items: ["Beanies", "Caps", "Berets"],
    },
    {
      heading: "Neckwear",
      items: ["Ties", "Scarves", "Bowties"],
    },
    {
      heading: "Handwear",
      items: ["Gloves", "Mittens"],
    },
  ],
  "BED & BATH LINEN": [
    {
      heading: "Bed Linen",
      items: ["Bed sheets", "Pillowcases", "Duvet covers"],
    },
    {
      heading: "Bedding Essentials",
      items: ["Pillows", "Quilts", "Comforters", "Mattress protectors"],
    },
    {
      heading: "Decorative Bedding",
      items: ["Bed runners", "Euro shams", "Bed skirts"],
    },
    {
      heading: "Bath Towels",
      items: ["Hand towels", "Bath towels", "Washcloths"],
    },
    {
      heading: "Bath Accessories",
      items: ["Shower curtains", "Bathrobes", "Toilet seat covers"],
    },
    {
      heading: "Table Linen",
      items: [
        "Tablecloths",
        "Table runners",
        "Placemats",
        "Cloth napkins",
        "Coasters",
      ],
    },
    {
      heading: "Kitchen Textiles",
      items: [
        "Aprons",
        "Oven mitts",
        "Pot holders",
        "Dish towels",
        "Microfiber cloths",
      ],
    },
  ],
  "HOME DECOR & FLOORING": [
    {
      heading: "Curtains",
      items: ["Blackout curtains", "Sheers", "Cafe curtains"],
    },
    {
      heading: "Blinds & Shades",
      items: ["Roller blinds", "Roman shades", "Venetian blinds"],
    },
    {
      heading: "Curtain Hardware",
      items: ["Curtain rods", "Finials", "Tie-backs"],
    },
    {
      heading: "Rugs & Carpets",
      items: ["Area rugs", "Runners", "Shag carpets", "Persian rugs"],
    },
    {
      heading: "Floor Mats",
      items: ["Doormats", "Bath mats", "Kitchen mats"],
    },
    {
      heading: "Cushions & Covers",
      items: ["Throw pillows", "Bolsters", "Floor cushions"],
    },
    {
      heading: "Upholstery",
      items: ["Sofa covers", "Chair pads", "Slipcovers"],
    },
    {
      heading: "Wall Textiles",
      items: ["Tapestries", "Macramé wall hangings"],
    },
  ],
};
