export const CUSTOMER_THEME = {
  // Primary blue — links, nav active, hero bg, icons, category badges
  bluePrimary: "#1A6FD4",

  // CTA yellow — Add to Cart, Shop Now, all purchase CTAs
  yellowCta: "#FFCC00",

  // CTA button text — always near-black, never white
  ctaText: "#1A1A2E",

  // Near-black — logo text, headings, product names, prices
  textPrimary: "#1A1A2E",

  // Page background — barely blue-tinted white
  bgPage: "#FFFFFF",

  // Card surface — product cards, nav, panels
  bgCard: "#FFFFFF",

  // Blue tint surface — image placeholders, category icon backgrounds
  bgBlueTint: "#EAF2FF",

  // Card border
  border: "#E8EEF4",

  // Search border
  borderSearch: "#D0E3F7",

  // Secondary text — descriptions, seller names, meta
  textSecondary: "#4B5563",

  // Muted text — strikethrough old price, timestamps, hints
  textMuted: "#9CA3AF",

  // Status colors
  inStock: "#16A34A",
  lowStock: "#D97706",
  outOfStock: "#DC2626",

  // Status badge backgrounds
  bgDelivered: "#DCFCE7",
  bgProcessing: "#FEF3C7",
  bgCancelled: "#FEE2E2",
} as const;
