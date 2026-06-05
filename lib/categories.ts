export interface CategoryColumn {
  heading: string;
  items: string[];
}

export const CATEGORY_TREE: Record<string, CategoryColumn[]> = {
  "Women Fashion": [
    { heading: "Clothing", items: ["Dresses", "Tops", "Bottoms", "Outerwear"] },
    { heading: "Accessories", items: ["Bags", "Jewelry", "Sunglasses"] }
  ],
  "Men Fashion": [
    { heading: "Clothing", items: ["Shirts", "Trousers", "Jackets", "Activewear"] },
    { heading: "Accessories", items: ["Watches", "Belts", "Wallets"] }
  ],
  "Retail": [
    { heading: "Kids Fashion", items: ["Boys", "Girls", "Infants"] },
    { heading: "Home & Living", items: ["Decor", "Bedding", "Kitchen"] }
  ]
};

export const TOP_LEVEL_CATEGORIES = Object.keys(CATEGORY_TREE);

export const ALL_SUBCATEGORY_ITEMS: string[] = Array.from(
  new Set(
    Object.values(CATEGORY_TREE)
      .flat()
      .flatMap((col) => col.items),
  ),
).sort((a, b) => a.localeCompare(b));
