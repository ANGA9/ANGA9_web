export interface CategoryColumn {
  heading: string;
  items: string[];
}

export const CATEGORY_TREE: Record<string, CategoryColumn[]> = {
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

export const TOP_LEVEL_CATEGORIES = Object.keys(CATEGORY_TREE);

export const ALL_SUBCATEGORY_ITEMS: string[] = Array.from(
  new Set(
    Object.values(CATEGORY_TREE)
      .flat()
      .flatMap((col) => col.items),
  ),
).sort((a, b) => a.localeCompare(b));
